import { AppLayout } from "@/components/layout/app-layout";
import { useCreateDocument } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, X, CheckCircle, Shield } from "lucide-react";
import { DocumentClassification, UrgencyLevel } from "@workspace/api-client-react";

export default function NewDocument() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateDocument();

  const [step, setStep] = useState(1);
  const [createdDocId, setCreatedDocId] = useState<number | null>(null);
  
  // Step 1
  const [subject, setSubject] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  
  // Step 2
  const [urgency, setUrgency] = useState<UrgencyLevel>("LOW");
  const [classification, setClassification] = useState<DocumentClassification>("PUBLIC");

  // Step 3
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (step === 1 && (!subject || !referenceNumber)) {
      toast({ variant: "destructive", title: "Validation Error", description: "Subject and Reference Number are required." });
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const res = await createMutation.mutateAsync({
        data: {
          subject,
          referenceNumber,
          description,
          urgency,
          classification
        }
      });

      // Upload files
      if (files.length > 0) {
        const token = localStorage.getItem('ministry_flow_token');
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch(`/api/documents/${res.id}/attachments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
        }
      }

      toast({ title: "Document Registered", description: `Reference: ${res.referenceNumber} created successfully.` });
      setLocation(`/inbox`);
    } catch (err) {
      toast({ variant: "destructive", title: "Registration Failed", description: "Could not create document." });
    }
  };

  return (
    <AppLayout title="">
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-6">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold tracking-widest uppercase mb-4">
            <Shield className="w-3 h-3 mr-2" /> Governance Portal
          </div>
          <h1 className="text-4xl font-serif text-slate-900 mb-2">Register Document</h1>
          <p className="text-slate-500">Transform physical records into secure digital assets</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`flex flex-col items-center relative z-10`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                  step >= i ? 'bg-primary border-primary text-white' : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                </div>
                <span className={`absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${step >= i ? 'text-primary' : 'text-slate-400'}`}>
                  {i === 1 ? 'Identity' : i === 2 ? 'Classification' : 'Digitization'}
                </span>
              </div>
              {i < 3 && (
                <div className={`w-24 h-0.5 mx-2 ${step > i ? 'bg-primary' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-xl overflow-hidden bg-white mt-10">
          <CardContent className="p-8">
            
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Document Subject *</Label>
                    <Input 
                      placeholder="e.g. Q3 Financial Statement" 
                      className="py-6 text-lg bg-slate-50 border-slate-200"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">File Reference *</Label>
                    <Input 
                      placeholder="MF/2024/FIN/001" 
                      className="py-6 text-lg font-mono bg-slate-50 border-slate-200 uppercase"
                      value={referenceNumber}
                      onChange={e => setReferenceNumber(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Executive Summary / Brief</Label>
                  <Textarea 
                    placeholder="Provide a high-level summary..." 
                    className="min-h-[120px] bg-slate-50 border-slate-200 resize-none"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4">
                <div className="space-y-4">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Urgency Level</Label>
                  <RadioGroup value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)} className="grid grid-cols-3 gap-4">
                    <Label className={`flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all ${urgency === 'LOW' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <RadioGroupItem value="LOW" className="sr-only" />
                      <div className="w-3 h-3 rounded-full bg-green-500 mb-3" />
                      <span className="font-bold text-slate-700">Low</span>
                    </Label>
                    <Label className={`flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all ${urgency === 'MEDIUM' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <RadioGroupItem value="MEDIUM" className="sr-only" />
                      <div className="w-3 h-3 rounded-full bg-amber-500 mb-3" />
                      <span className="font-bold text-slate-700">Medium</span>
                    </Label>
                    <Label className={`flex flex-col items-center justify-center p-6 border rounded-xl cursor-pointer transition-all ${urgency === 'HIGH' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <RadioGroupItem value="HIGH" className="sr-only" />
                      <div className="w-3 h-3 rounded-full bg-red-500 mb-3" />
                      <span className="font-bold text-slate-700">High</span>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Document Classification</Label>
                  <RadioGroup value={classification} onValueChange={(v) => setClassification(v as DocumentClassification)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['PUBLIC', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET'].map(level => (
                      <Label key={level} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${classification === level ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <RadioGroupItem value={level} className="mr-3" />
                        <span className="font-semibold text-sm text-slate-700">{level.replace('_', ' ')}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div 
                  className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-12 text-center cursor-pointer flex flex-col items-center justify-center group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">Drag & drop files here or click to browse</h3>
                  <p className="text-sm text-slate-500">Supported: PDF, Word, Images, etc.</p>
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="*/*"
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Attached Files ({files.length})</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                          <div className="truncate flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                            <p className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 h-8 w-8 ml-2 shrink-0" onClick={() => removeFile(i)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
              <Button variant="outline" onClick={step === 1 ? () => setLocation('/inbox') : handleBack}>
                {step === 1 ? "Cancel" : "Previous"}
              </Button>
              <Button 
                onClick={step === 3 ? handleSubmit : handleNext} 
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90 px-8"
              >
                {step === 3 ? (createMutation.isPending ? "Processing..." : "Submit Registration") : "Continue"}
              </Button>
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-center items-center gap-8 mt-8 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center"><Shield className="w-4 h-4 mr-2" /> Encrypted Transaction</span>
          <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Real-time Audit</span>
        </div>

      </div>
    </AppLayout>
  );
}
