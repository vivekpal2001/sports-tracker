import { jsPDF } from 'jspdf';

// Generate Weekly Training Plan PDF
export const generateTrainingPlanPDF = async (user, weeklyData, aiInsights) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor = [0, 212, 255]; // Electric blue
  const darkColor = [15, 15, 25];
  const accentColor = [132, 255, 0]; // Lime green
  
  // Header background
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo/Title
  doc.setTextColor(...primaryColor);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SPORTS PERFORMANCE TRACKER', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('Weekly Training Plan', pageWidth / 2, 32, { align: 'center' });
  
  // Athlete info
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Athlete: ${user.name}`, pageWidth / 2, 40, { align: 'center' });
  
  let yPos = 55;
  
  // Performance Score Section
  doc.setFillColor(20, 20, 35);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AI PERFORMANCE SCORE', 25, yPos + 12);
  
  const score = aiInsights?.performanceScore ?? 0;
  doc.setFontSize(28);
  doc.setTextColor(...accentColor);
  doc.text(`${score}`, pageWidth - 45, yPos + 22);
  doc.setFontSize(12);
  doc.text('/100', pageWidth - 25, yPos + 22);
  
  // Score breakdown
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const breakdown = aiInsights?.scoreBreakdown || {};
  doc.text(`Consistency: ${breakdown.consistency ?? 0}%  |  Intensity: ${breakdown.intensity ?? 0}%  |  Recovery: ${breakdown.recovery ?? 0}%`, 25, yPos + 28);
  
  yPos += 45;
  
  // Weekly Summary
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('WEEKLY SUMMARY', 15, yPos);
  
  yPos += 8;
  doc.setDrawColor(...primaryColor);
  doc.line(15, yPos, 80, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  
  const stats = weeklyData?.stats || {};
  const summaryItems = [
    `Total Workouts: ${stats.totalWorkouts || 0}`,
    `Total Training Time: ${Math.round((stats.totalDuration || 0) / 60)} hours ${(stats.totalDuration || 0) % 60} minutes`,
    `Average RPE: ${stats.avgRpe || 'N/A'}`,
    `Running Distance: ${stats.runningStats?.distance?.toFixed(1) || 0} km`,
    `Training Load: ${aiInsights?.weeklyTrainingLoad || 'Moderate'}`
  ];
  
  summaryItems.forEach(item => {
    doc.text(`• ${item}`, 20, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  // Key Insights
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY INSIGHTS', 15, yPos);
  
  yPos += 8;
  doc.setDrawColor(...accentColor);
  doc.line(15, yPos, 65, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  
  const insights = aiInsights?.keyInsights?.length > 0 
    ? aiInsights.keyInsights 
    : ['No insights yet - log workouts to get AI analysis'];
  
  insights.forEach((insight, i) => {
    doc.setTextColor(...primaryColor);
    doc.text(`${i + 1}.`, 20, yPos);
    doc.setTextColor(200, 200, 200);
    doc.text(insight, 28, yPos);
    yPos += 8;
  });
  
  yPos += 5;
  
  // Recommended Weekly Plan
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDED TRAINING PLAN', 15, yPos);
  
  yPos += 8;
  doc.setDrawColor(...primaryColor);
  doc.line(15, yPos, 100, yPos);
  
  yPos += 10;
  
  const weeklyPlan = aiInsights?.weeklyPlan || {
    monday: 'No plan - log workouts first',
    tuesday: 'No plan',
    wednesday: 'No plan',
    thursday: 'No plan',
    friday: 'No plan',
    saturday: 'No plan',
    sunday: 'No plan'
  };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach((day, i) => {
    doc.setFillColor(25, 25, 40);
    doc.roundedRect(15, yPos - 4, pageWidth - 30, 10, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(day, 20, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text(weeklyPlan[dayKeys[i]] || 'Rest', 55, yPos + 2);
    
    yPos += 12;
  });
  
  yPos += 5;
  
  // Recommendations
  if (yPos < 240) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI RECOMMENDATIONS', 15, yPos);
    
    yPos += 8;
    doc.setDrawColor(...accentColor);
    doc.line(15, yPos, 85, yPos);
    
    yPos += 10;
    
    const recommendations = aiInsights?.recommendations?.slice(0, 3) || [];
    recommendations.forEach(rec => {
      doc.setFillColor(25, 25, 40);
      doc.roundedRect(15, yPos - 4, pageWidth - 30, 16, 2, 2, 'F');
      
      // Priority badge
      const priorityColors = {
        high: [255, 51, 102],
        medium: [255, 165, 0],
        low: [132, 255, 0]
      };
      doc.setFillColor(...(priorityColors[rec.priority] || priorityColors.medium));
      doc.roundedRect(18, yPos - 2, 25, 6, 1, 1, 'F');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(rec.priority?.toUpperCase() || 'MEDIUM', 20, yPos + 2);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(rec.title || '', 48, yPos + 2);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      const description = rec.description || '';
      doc.text(description.substring(0, 80) + (description.length > 80 ? '...' : ''), 20, yPos + 10);
      
      yPos += 20;
    });
  }
  
  // Footer
  doc.setFillColor(...darkColor);
  doc.rect(0, 280, pageWidth, 20, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated by Sports Performance Tracker with AI Insights', pageWidth / 2, 288, { align: 'center' });
  doc.text(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth / 2, 294, { align: 'center' });
  
  return doc.output('arraybuffer');
};
