import { AppLayout } from "@/components/layout/app-layout";
import { useGetDocuments } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function DocumentList() {
  const { data: documents, isLoading } = useGetDocuments();
  const [search, setSearch] = useState("");

  const filteredDocs = documents?.filter(d => 
    d.subject.toLowerCase().includes(search.toLowerCase()) || 
    d.referenceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="All Documents">
      <div className="animate-in fade-in duration-500 space-y-6">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by reference or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-200 bg-slate-50"
            />
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading records...</div>
          ) : filteredDocs && filteredDocs.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600 py-4">Reference No.</TableHead>
                  <TableHead className="font-semibold text-slate-600">Subject</TableHead>
                  <TableHead className="font-semibold text-slate-600">Originator</TableHead>
                  <TableHead className="font-semibold text-slate-600">Current Holder</TableHead>
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`/documents/${doc.id}`} className="text-primary hover:underline font-semibold">
                        {doc.referenceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-slate-700">{doc.subject}</TableCell>
                    <TableCell className="text-slate-600">{doc.originator?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-slate-600">{doc.currentHolder?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-slate-500">{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status.toLowerCase() as any} className="uppercase text-[10px]">
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center text-slate-500">
              No documents found matching your criteria.
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
