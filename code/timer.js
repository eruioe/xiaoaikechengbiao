async function scheduleTimer({ providerRes, parserRes } = {}) {
  return {
    totalWeek: 20, // 周数
    startSemester:'',
    startWithSunday: false, // 课表列顺序为周一到周日
    showWeekend: false, // 课表包含周六、日课程
    forenoon: 4,
    afternoon: 4,
    night: 2,
    sections: [
      // 上午课程
      { section: 1, startTime: '08:30', endTime: '09:10' },
      { section: 2, startTime: '09:20', endTime: '10:00' },
      { section: 3, startTime: '10:20', endTime: '11:00' },
      { section: 4, startTime: '11:10', endTime: '11:50' },
      
      // 下午课程
      { section: 5, startTime: '14:30', endTime: '15:10' },
      { section: 6, startTime: '15:20', endTime: '16:00' },
      { section: 7, startTime: '16:10', endTime: '16:50' },
      { section: 8, startTime: '16:50', endTime: '17:30' },
      
      // 晚上课程
      { section: 9, startTime: '19:40', endTime: '20:20' },
      { section: 10, startTime: '20:30', endTime: '21:10' }
    ]
  }
  
}