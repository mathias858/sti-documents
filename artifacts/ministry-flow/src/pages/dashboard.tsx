import { AppLayout } from "@/components/layout/app-layout";
import { useGetDocuments, DocumentStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Inbox, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { DocumentDetailSheet } from "@/components/document-detail-sheet";

export default function Dashboard() {
  const { data: allDocs, isLoading: loadingAll } = useGetDocuments();
  const { data: inboxDocs, isLoading: loadingInbox } = useGetDocuments({ view: 'inbox' });
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const stats = [
    {
      title: "Total Documents",
      value: allDocs?.length || 0,
      icon: FileText,
      color: "text-slate-600",
      bg: "bg-slate-100",
      link: "/search"
    },
    {
      title: "In My Tray",
      value: inboxDocs?.length || 0,
      icon: Inbox,
      color: "text-blue-600",
      bg: "bg-blue-100",
      link: "/inbox"
    },
    {
      title: "Pending",
      value: allDocs?.filter(d => d.status === DocumentStatus.RECEIVED || d.status === DocumentStatus.IN_TRANSIT).length || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
      link: "/search"
    },
    {
      title: "Signed / Closed",
      value: allDocs?.filter(d => d.status === DocumentStatus.SIGNED || d.status === DocumentStatus.CLOSED).length || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      link: "/archive"
    }
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">LOW</Badge>;
      case 'MEDIUM': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">MEDIUM</Badge>;
      case 'HIGH': return <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-600">HIGH</Badge>;
      default: return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED': return <Badge className="bg-blue-500 hover:bg-blue-600">RECEIVED</Badge>;
      case 'IN_TRANSIT': return <Badge className="bg-cyan-500 hover:bg-cyan-600">IN TRANSIT</Badge>;
      case 'RETURNED': return <Badge className="bg-orange-500 hover:bg-orange-600">RETURNED</Badge>;
      case 'SIGNED': return <Badge className="bg-green-500 hover:bg-green-600">SIGNED</Badge>;
      case 'CLOSED': return <Badge variant="secondary" className="bg-slate-600 text-white">CLOSED</Badge>;
      default: return <Badge variant="secondary">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <AppLayout title="">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of system activity and document flow</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Link key={i} href={stat.link} className="block">
              <Card className="hover:shadow-lg transition-shadow duration-300 border-slate-200 cursor-pointer group bg-white">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                      {loadingAll || loadingInbox ? "-" : stat.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50">
            <CardTitle className="text-lg font-bold text-slate-800">Recent Documents</CardTitle>
          </CardHeader>
          {loadingAll ? (
            <div className="p-12 text-center text-slate-400">Loading documents...</div>
          ) : allDocs && allDocs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px] font-semibold text-slate-600 text-xs uppercase tracking-wider">Reference No</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Subject</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Current Holder</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Urgency</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDocs.slice(0, 10).map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50/80 cursor-pointer transition-colors group" onClick={() => setSelectedDocId(doc.id)}>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {doc.referenceNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {doc.subject}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {doc.currentHolder.name} ({doc.currentHolder.department.code})
                      </TableCell>
                      <TableCell className="text-slate-500 whitespace-nowrap">
                        {formatDate(doc.updatedAt)}
                      </TableCell>
                      <TableCell>
                        {getUrgencyBadge(doc.urgency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(doc.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No documents found in the system.</p>
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
