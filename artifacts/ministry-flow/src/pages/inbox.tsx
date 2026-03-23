import { AppLayout } from "@/components/layout/app-layout";
import { useGetDocuments } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Inbox as InboxIcon, Eye, CornerUpRight, Download, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DocumentDetailSheet } from "@/components/document-detail-sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Inbox() {
  const { data: documents, isLoading } = useGetDocuments({ view: 'inbox' });
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'LOW':
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">LOW</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">MEDIUM</Badge>;
      case 'HIGH':
        return <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-600">HIGH</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return <Badge className="bg-blue-500 hover:bg-blue-600">RECEIVED</Badge>;
      case 'IN_TRANSIT':
        return <Badge className="bg-cyan-500 hover:bg-cyan-600">IN TRANSIT</Badge>;
      case 'RETURNED':
        return <Badge className="bg-orange-500 hover:bg-orange-600">RETURNED</Badge>;
      case 'SIGNED':
        return <Badge className="bg-green-500 hover:bg-green-600">SIGNED</Badge>;
      default:
        return <Badge variant="secondary">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <AppLayout title="">
      <div className="animate-in fade-in duration-500 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">In-Tray</h1>
          <p className="text-slate-500 mt-1">Documents awaiting your attention</p>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by subject or reference..." className="pl-9 bg-slate-50 border-slate-200 w-full" />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all_sources">
                <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_sources">All Sources</SelectItem>
                  {/* Mock options */}
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="fin">Finance</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all_urgency">
                <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_urgency">All Urgency</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading inbox...</div>
          ) : documents && documents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[140px] font-semibold text-slate-600 text-xs uppercase tracking-wider">Reference No</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider min-w-[200px]">Subject</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">From (Office)</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Date Received</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Urgency</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="font-mono text-xs text-slate-500 cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                        {doc.referenceNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                        {doc.subject}
                      </TableCell>
                      <TableCell className="text-slate-600 cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                        {doc.originator?.department?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-slate-500 whitespace-nowrap cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                        {formatDate(doc.updatedAt)}
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                        {getUrgencyBadge(doc.urgency)}
                      </TableCell>
                      <TableCell className="cursor-pointer" onClick={() => setSelectedDocId(doc.id)}>
                        {getStatusBadge(doc.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => setSelectedDocId(doc.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                            <CornerUpRight className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <InboxIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
              <p className="text-slate-500 mt-1">There are no documents requiring your attention.</p>
            </div>
          )}
        </Card>
      </div>

      <DocumentDetailSheet 
        documentId={selectedDocId} 
        open={selectedDocId !== null} 
        onOpenChange={(open) => {
          if (!open) setSelectedDocId(null);
        }} 
      />
    </AppLayout>
  );
}
