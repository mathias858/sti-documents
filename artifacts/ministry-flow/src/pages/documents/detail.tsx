import { AppLayout } from "@/components/layout/app-layout";
import { 
  useGetDocumentById, 
  useGetDocumentMinutes, 
  useGetDocumentMovements,
  useForwardDocument,
  useSignDocument,
  useAddMinuteEntry,
  useGetUsers,
  DocumentStatus,
  DigitalSignatureStatus
} from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Send, CornerUpLeft, PenTool, MessageSquarePlus, History, FileText, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function DocumentDetail() {
  const [, params] = useRoute("/documents/:id");
  const docId = Number(params?.id);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: doc, isLoading: loadingDoc } = useGetDocumentById(docId);
  const { data: minutes, isLoading: loadingMinutes } = useGetDocumentMinutes(docId);
  const { data: movements, isLoading: loadingMovements } = useGetDocumentMovements(docId);
  const { data: users } = useGetUsers();

  const forwardMutation = useForwardDocument();
  const signMutation = useSignDocument();
  const addMinuteMutation = useAddMinuteEntry();

  const [dialogOpen, setDialogOpen] = useState<string | null>(null);
  
  // Form states
  const [recipientId, setRecipientId] = useState<string>("");
  const [textInput, setTextInput] = useState("");

  if (loadingDoc) return <AppLayout title="Document Details"><div className="p-8">Loading...</div></AppLayout>;
  if (!doc) return <AppLayout title="Document Not Found"><div className="p-8">Not found.</div></AppLayout>;

  const isCurrentHolder = user?.id === doc.currentHolderId;
  const canSign = user?.role?.canSign && doc.status !== DocumentStatus.SIGNED && doc.status !== DocumentStatus.CLOSED && isCurrentHolder;

  const handleAction = (actionType: 'FORWARD' | 'RETURN' | 'SIGN' | 'MINUTE') => {
    const onSuccess = () => {
      setDialogOpen(null);
      setTextInput("");
      setRecipientId("");
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}/minutes`] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${docId}/movements`] });
      toast({ title: "Success", description: "Action completed successfully." });
    };

    if (actionType === 'FORWARD' || actionType === 'RETURN') {
      if (!recipientId || !textInput) return toast({ variant: "destructive", title: "Error", description: "All fields required" });
      forwardMutation.mutate({ 
        id: docId, 
        data: { toUserId: Number(recipientId), minuteText: textInput, action: actionType } 
      }, { onSuccess });
    } else if (actionType === 'SIGN') {
      if (!textInput) return toast({ variant: "destructive", title: "Error", description: "Remarks required" });
      signMutation.mutate({ id: docId, data: { remarks: textInput } }, { onSuccess });
    } else if (actionType === 'MINUTE') {
      if (!textInput) return toast({ variant: "destructive", title: "Error", description: "Text required" });
      addMinuteMutation.mutate({ id: docId, data: { text: textInput } }, { onSuccess });
    }
    return;
  };

  return (
    <AppLayout title="Document Details">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
        
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-white p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-2">Reference Number</p>
                  <h2 className="text-3xl font-mono font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-lg inline-block border border-slate-200">
                    {doc.referenceNumber}
                  </h2>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={doc.status.toLowerCase() as any} className="text-sm px-3 py-1 uppercase tracking-wider">
                    {doc.status.replace('_', ' ')}
                  </Badge>
                  {doc.digitalSignatureStatus === DigitalSignatureStatus.SIGNED && (
                    <Badge variant="signed" className="text-xs px-2 py-1 flex items-center bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Digitally Signed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900">{doc.subject}</h3>
                </div>
                {doc.description && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed">
                    {doc.description}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 mt-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Originator</p>
                    <p className="font-medium text-slate-800">{doc.originator.name}</p>
                    <p className="text-xs text-slate-500">{doc.originator.department.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Current Location</p>
                    <p className="font-medium text-blue-700">{doc.currentHolder.name}</p>
                    <p className="text-xs text-slate-500">{doc.currentHolder.department.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs for Minutes and Movements */}
          <Card className="border-slate-200 shadow-sm min-h-[500px]">
            <Tabs defaultValue="minutes" className="w-full">
              <div className="border-b border-slate-200 px-4 pt-4 bg-slate-50 rounded-t-xl">
                <TabsList className="bg-transparent space-x-4">
                  <TabsTrigger value="minutes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <MessageSquarePlus className="w-4 h-4 mr-2" /> Minute Sheet
                  </TabsTrigger>
                  <TabsTrigger value="movements" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent">
                    <History className="w-4 h-4 mr-2" /> Movement History
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="minutes" className="p-0 m-0">
                <div className="p-6 space-y-6">
                  {loadingMinutes ? (
                    <p className="text-center text-slate-500 py-8">Loading minutes...</p>
                  ) : minutes?.length === 0 ? (
                    <div className="text-center text-slate-400 py-12">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No minutes recorded yet.</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                      {minutes?.map((minute, idx) => (
                        <div key={minute.id} className="relative pl-6">
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-primary" />
                          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-semibold text-slate-900">{minute.user.name}</span>
                                <span className="text-xs text-slate-500 ml-2">({minute.user.department.code})</span>
                              </div>
                              <span className="text-xs text-slate-400">{formatDateTime(minute.createdAt)}</span>
                            </div>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{minute.text}</p>
                            {minute.action && (
                              <Badge variant="outline" className="mt-3 text-[10px] bg-slate-50">Action: {minute.action}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="movements" className="p-0 m-0">
                <div className="p-6">
                  {loadingMovements ? (
                    <p className="text-center text-slate-500 py-8">Loading history...</p>
                  ) : (
                    <div className="space-y-4">
                      {movements?.map((mov) => (
                        <div key={mov.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            {mov.action === 'FORWARD' ? <Send className="w-4 h-4 text-blue-500" /> : <CornerUpLeft className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-slate-900">{mov.fromUser.name}</span>
                              <span className="text-slate-500 mx-2">→</span>
                              <span className="font-medium text-slate-900">{mov.toUser.name}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{formatDateTime(mov.createdAt)}</p>
                          </div>
                          <Badge variant="outline">{mov.action}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-md sticky top-24">
            <div className="bg-primary p-4 rounded-t-xl text-white flex items-center">
              <PenTool className="w-5 h-5 mr-2 text-accent" />
              <h3 className="font-serif text-lg">Document Actions</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              
              {!isCurrentHolder ? (
                <div className="p-4 bg-slate-50 text-slate-600 rounded-lg text-sm text-center border border-slate-200">
                  Document is currently with <strong className="text-slate-900">{doc.currentHolder.name}</strong>. You cannot take action.
                </div>
              ) : doc.status === DocumentStatus.CLOSED ? (
                <div className="p-4 bg-slate-100 text-slate-600 rounded-lg text-sm text-center">
                  Document is closed. No further actions permitted.
                </div>
              ) : (
                <>
                  <Dialog open={dialogOpen === 'FORWARD'} onOpenChange={(o) => setDialogOpen(o ? 'FORWARD' : null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start text-left bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm" variant="outline">
                        <Send className="w-4 h-4 mr-3" /> Forward to Official
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Forward Document</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Recipient</Label>
                          <Select value={recipientId} onValueChange={setRecipientId}>
                            <SelectTrigger><SelectValue placeholder="Select official..." /></SelectTrigger>
                            <SelectContent>
                              {users?.filter(u => u.id !== user?.id).map(u => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.name} - {u.department.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Minute Text</Label>
                          <Textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Please minute instructions..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => handleAction('FORWARD')} disabled={forwardMutation.isPending}>Forward</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={dialogOpen === 'RETURN'} onOpenChange={(o) => setDialogOpen(o ? 'RETURN' : null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start text-left bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm" variant="outline">
                        <CornerUpLeft className="w-4 h-4 mr-3" /> Return Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Return Document</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Return To</Label>
                          <Select value={recipientId} onValueChange={setRecipientId}>
                            <SelectTrigger><SelectValue placeholder="Select official..." /></SelectTrigger>
                            <SelectContent>
                              {users?.filter(u => u.id !== user?.id).map(u => (
                                <SelectItem key={u.id} value={u.id.toString()}>{u.name} - {u.department.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Reason for Return (Minute)</Label>
                          <Textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Explain why returning..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => handleAction('RETURN')} disabled={forwardMutation.isPending}>Return</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={dialogOpen === 'MINUTE'} onOpenChange={(o) => setDialogOpen(o ? 'MINUTE' : null)}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start text-left bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm" variant="outline">
                        <MessageSquarePlus className="w-4 h-4 mr-3" /> Add Minute Only
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Minute Entry</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Minute Text</Label>
                          <Textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Record a note without moving document..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => handleAction('MINUTE')} disabled={addMinuteMutation.isPending}>Save Minute</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {canSign && (
                    <Dialog open={dialogOpen === 'SIGN'} onOpenChange={(o) => setDialogOpen(o ? 'SIGN' : null)}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start text-left bg-emerald-600 text-white hover:bg-emerald-700 shadow-md mt-4">
                          <PenTool className="w-4 h-4 mr-3" /> Digitally Sign & Close
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Sign Document</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg text-sm mb-4">
                            By signing, you officially authorize this document and change its status to SIGNED.
                          </div>
                          <div className="space-y-2">
                            <Label>Final Remarks (Minute)</Label>
                            <Textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Approved and signed..." />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => handleAction('SIGN')} className="bg-emerald-600 hover:bg-emerald-700" disabled={signMutation.isPending}>Authorize & Sign</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
