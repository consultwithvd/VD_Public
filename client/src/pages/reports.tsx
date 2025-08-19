import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  Handshake,
  BarChart3,
  PieChart,
  FileText,
  Mail
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [format, setFormat] = useState("PDF");
  const [includeGST, setIncludeGST] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const reportTypes = [
    {
      id: "revenue",
      name: "Revenue Report",
      description: "Monthly and yearly revenue analysis",
      icon: TrendingUp,
      color: "bg-vivid-purple/10 text-vivid-purple",
    },
    {
      id: "profit",
      name: "Profit Analysis",
      description: "Profitability breakdown by software",
      icon: DollarSign,
      color: "bg-vivid-orange/10 text-vivid-orange",
    },
    {
      id: "renewal",
      name: "Renewal Report",
      description: "Subscription renewal trends",
      icon: RefreshCw,
      color: "bg-vivid-pink/10 text-vivid-pink",
    },
    {
      id: "reseller",
      name: "Reseller Report",
      description: "Commission and performance tracking",
      icon: Handshake,
      color: "bg-vivid-blue/10 text-vivid-blue",
    },
  ];

  const handleGenerateReport = () => {
    // TODO: Implement report generation
    console.log("Generating report:", {
      reportType,
      dateRange,
      format,
      includeGST,
      sendEmail,
    });
  };

  return (
    <main className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate detailed reports and track performance metrics</p>
        </div>
        <Button className="bg-vivid-purple hover:bg-vivid-purple/90">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                reportType === report.id ? "ring-2 ring-vivid-purple" : ""
              }`}
              onClick={() => setReportType(report.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {report.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Generation Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Format
              </label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                className="w-full bg-vivid-purple hover:bg-vivid-purple/90"
                disabled={!reportType || !dateRange}
              >
                Generate Report
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeGST"
                checked={includeGST}
                onCheckedChange={(checked) => setIncludeGST(checked as boolean)}
              />
              <label htmlFor="includeGST" className="text-sm text-gray-700 dark:text-gray-300">
                Include GST Details
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-700 dark:text-gray-300">
                Send via Gmail
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Report - Last 30 Days</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹24,67,890</p>
              <p className="text-sm text-status-active">+12.5% from last month</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">₹8,45,230</p>
              <p className="text-sm text-vivid-orange">+8.3% from last month</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">247</p>
              <p className="text-sm text-vivid-purple">+15 new this month</p>
            </div>
          </div>

          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Revenue Trend Chart</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Chart visualization will be rendered here
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
