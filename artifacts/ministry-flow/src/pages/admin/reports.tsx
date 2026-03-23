import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as BarChartIcon, TrendingUp, Users, FileText, CheckCircle2 } from "lucide-react";
import { useGetDocuments, useGetUsers } from "@workspace/api-client-react";

export default function AdminReports() {
  const { data: documents } = useGetDocuments();
  const { data: users } = useGetUsers();

  const stats = [
    { label: "Total Documents", value: documents?.length || 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Users", value: users?.length || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Completion Rate", value: "84%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Monthly Growth", value: "+12%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  return (
    <AppLayout title="">
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Reports</h1>
          <p className="text-slate-500 mt-1">Analytics and performance metrics for the ministry workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg flex items-center">
              <BarChartIcon className="w-5 h-5 mr-2 text-primary" />
              Workflow Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <BarChartIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Advanced Analytics Coming Soon</h3>
              <p className="text-slate-500">Detailed graphical visualizations and custom data exports are currently being finalized for the prochain production release.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
