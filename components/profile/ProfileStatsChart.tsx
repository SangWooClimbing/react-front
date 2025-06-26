
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { UserProfile } from '../../types';

interface ProfileStatsChartProps {
  profile: UserProfile;
}

const COLORS_GRADES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A020F0'];
const COLORS_TYPES = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} climbs`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const ProfileStatsChart: React.FC<ProfileStatsChartProps> = ({ profile }) => {
  const [activeIndexGrades, setActiveIndexGrades] = React.useState(0);
  const [activeIndexTypes, setActiveIndexTypes] = React.useState(0);

  const gradeData = Object.entries(profile.solvedStats.grades)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => { // Sort by difficulty, assuming V0 < V1 etc.
        const aVal = parseInt(a.name.replace('V','').replace('B','-1').replace('10+','10'));
        const bVal = parseInt(b.name.replace('V','').replace('B','-1').replace('10+','10'));
        return aVal - bVal;
    });

  const problemTypeData = Object.entries(profile.solvedStats.problemTypes)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value); // Sort by count

  const onPieEnterGrades = (_: any, index: number) => setActiveIndexGrades(index);
  const onPieEnterTypes = (_: any, index: number) => setActiveIndexTypes(index);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Climbs by Grade</h3>
        {gradeData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              activeIndex={activeIndexGrades}
              activeShape={renderActiveShape}
              data={gradeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnterGrades}
            >
              {gradeData.map((entry, index) => (
                <Cell key={`cell-grade-${index}`} fill={COLORS_GRADES[index % COLORS_GRADES.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        ) : <p className="text-neutral">No grade data available.</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Climbs by Problem Type</h3>
        {problemTypeData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
             <Pie
              activeIndex={activeIndexTypes}
              activeShape={renderActiveShape}
              data={problemTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#82ca9d"
              dataKey="value"
              onMouseEnter={onPieEnterTypes}
            >
              {problemTypeData.map((entry, index) => (
                <Cell key={`cell-type-${index}`} fill={COLORS_TYPES[index % COLORS_TYPES.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        ) : <p className="text-neutral">No problem type data available.</p>}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Grade Progression (Bar Chart Example)</h3>
        {gradeData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gradeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3B82F6" name="Sends" />
          </BarChart>
        </ResponsiveContainer>
        ) : <p className="text-neutral">No grade data for bar chart.</p>}
      </div>
    </div>
  );
};

export default ProfileStatsChart;
    