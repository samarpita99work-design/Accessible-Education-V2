import { TopBar } from "@/components/top-bar";
import { Card, CardContent } from "@/components/ui/card";
import { adminStats } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";

const COLORS = ["#355872", "#7AAACE", "#9CD5FF", "#5C7A99", "#2E8B6E"];

const engagementData = [
  { week: "W1", views: 420, unique: 280 },
  { week: "W2", views: 510, unique: 310 },
  { week: "W3", views: 480, unique: 290 },
  { week: "W4", views: 560, unique: 340 },
  { week: "W5", views: 620, unique: 380 },
  { week: "W6", views: 590, unique: 360 },
  { week: "W7", views: 640, unique: 400 },
  { week: "W8", views: 710, unique: 420 },
];

const formatPreference = [
  { name: "Original", value: 45 },
  { name: "Audio", value: 22 },
  { name: "Captions", value: 18 },
  { name: "Simplified", value: 10 },
  { name: "Braille", value: 5 },
];

export default function AdminAnalytics() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Analytics" />
      <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Content Engagement — Weekly</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="views" stroke="#7AAACE" fill="#9CD5FF" fillOpacity={0.3} strokeWidth={2} />
                    <Area type="monotone" dataKey="unique" stroke="#355872" fill="#355872" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Format Preference Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={formatPreference} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}%`} labelLine>
                      {formatPreference.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Monthly Conversion Volume</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={adminStats.monthlyConversions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="successful" fill="#7AAACE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#C0392B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-serif text-sm font-semibold mb-4">Format Usage Rates (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={adminStats.formatUsage} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="format" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#355872" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
