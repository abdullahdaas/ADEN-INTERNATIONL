const fs = require('fs');
let code = fs.readFileSync('src/components/AdminGISPanel.tsx', 'utf8');

const importRecharts = `import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';`;

if (!code.includes('recharts')) {
  code = code.replace(`import { Layers,`, `${importRecharts}\nimport { Layers,`);
}

const analyticsReplacement = `<div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl col-span-1 md:col-span-2 lg:col-span-3 h-80">
            <h3 className="text-slate-400 text-xs mb-4">توزيع أنواع العقارات</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData}>
                <XAxis dataKey="gov" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff'}} />
                <Bar dataKey="count" fill="#F27D26" radius={[4, 4, 0, 0]} name="عدد العقارات" />
              </BarChart>
            </ResponsiveContainer>
          </div>`;

code = code.replace(
  /<div className="bg-slate-900\/50 border border-white\/5 p-6 rounded-2xl">[\s\S]*?<h3 className="text-slate-400 text-xs mb-2">توزيع أنواع العقارات<\/h3>[\s\S]*?<\/div>/m,
  analyticsReplacement
);

fs.writeFileSync('src/components/AdminGISPanel.tsx', code);
console.log("Patched AdminGISPanel with recharts");
