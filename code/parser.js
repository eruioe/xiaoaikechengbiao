function scheduleHtmlParser(html) {
    const $ = cheerio.load(html, { decodeEntities: false })
    let courses = []

    // 工具函数：清理文本
    const cleanText = text => {
        if (!text) return ''
        return text.replace(/\s+/g, '').trim()
    }

    // 工具函数：解析周次
    const parseWeeks = text => {
        if (!text) return []
        const weeks = new Set()
        // 移除所有空格和"周"字
        const parts = text.replace(/[周\s]/g, '').split(',')
        
        parts.forEach(part => {
            if (part.includes('-')) {
                // 处理连续周，如"1-18"
                const [start, end] = part.split('-').map(Number)
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                        if (i > 0 && i <= 30) weeks.add(i) // 确保周次在有效范围内
                    }
                }
            } else {
                // 处理单周，如"19"
                const week = parseInt(part)
                if (!isNaN(week) && week > 0 && week <= 30) {
                    weeks.add(week)
                }
            }
        })
        
        return Array.from(weeks).sort((a, b) => a - b)
    }

    // 工具函数：解析教室位置
    const parsePosition = text => {
        if (!text) return ''
        text = cleanText(text)
        
        // 处理体育课场地格式 - 移除[xx-xx]格式的编号和"节"字
        text = text.replace(/\[\d{2}-\d{2}\]/g, '')
                  .replace(/节/g, '')
                  .trim()
        
        // 处理特殊教室格式
        const patterns = [
            /信息交通\d+-\d+/,
            /公共\d+-\d+/,
            /实验室\d+/,
            /\d+号楼\d+/,
            /[\u4e00-\u9fa5]+\d+体\d+.*?(?=\[|$)/, // 匹配任何校区的体育场地
            /[\u4e00-\u9fa5]+.*?场\d*/, // 匹配任何校区的球场等场地
            /体育场\d*/, // 匹配普通体育场
            /游泳馆\d*/, // 匹配游泳馆
            /体育馆\d*/ // 匹配体育馆
        ]
        
        for (const pattern of patterns) {
            const match = text.match(pattern)
            if (match) return match[0]
        }
        
        
        return text
    }

    // 工具函数：获取节次范围
    const getSections = rowIndex => {
        const sectionMap = {
            0: [1, 2],   // 第一大节
            1: [3, 4],   // 第二大节
            2: [5, 6],   // 第三大节
            3: [7, 8],   // 第四大节
            4: [9, 10]   // 第五大节
        }
        return sectionMap[rowIndex] || []
    }

    // 解析课程信息
    const parseCourseInfo = ($cell, day, sections) => {
        const courseTexts = $cell.html().split('---------------------')
        const courses = []

        courseTexts.forEach(courseText => {
            if (!courseText.trim()) return

            const $course = $('<div>').html(courseText)
            const courseInfo = {
                name: '',
                position: '',
                teacher: '',
                weeks: [],
                day: day + 1, 
                sections: sections
            }

            // 解析课程名称
            const $temp = $course.clone()
            $temp.find('font').remove()
            courseInfo.name = cleanText($temp.text())
                .replace(/^-+/, '')
                .replace(/-+$/, '')

            // 解析其他信息（教师、教室、周次）
            $course.find('font').each(function() {
                const $font = $(this)
                const title = $font.attr('title')
                const text = cleanText($font.text())

                if (!title || !text) return

                switch(title) {
                    case '周次(节次)':
                    case '周次（节次）':
                        courseInfo.weeks = parseWeeks(text)
                        break
                    case '教室':
                        courseInfo.position = parsePosition(text) || '未知'
                        break
                    case '老师':
                        courseInfo.teacher = text || '未知'
                        break
                }
            })

            // 验证课程信息完整性并添加默认值
            if (courseInfo.name && courseInfo.day > 0) {
                // 确保必填字段有值
                courseInfo.name = courseInfo.name.substring(0, 50)
                courseInfo.position = (courseInfo.position || '未知').substring(0, 50)
                courseInfo.teacher = (courseInfo.teacher || '未知').substring(0, 50)
                courseInfo.weeks = courseInfo.weeks.length ? courseInfo.weeks : [1]
                courseInfo.sections = sections.length ? sections : [1]
                
                courses.push(courseInfo)
            }
        })

        return courses
    }

    // 遍历课表 - 修改此处处理逻辑
    $('table tr').slice(1).each(function(rowIndex) {
        const sections = getSections(rowIndex)
        if (sections.length === 0) return

        $(this).find('td').each(function(colIndex) {
            // 跳过表头行和超出星期范围的列
            if (colIndex > 6) return
            
            const $cell = $(this)
            if ($cell.text().trim() === '') return

            const day = colIndex 
            const coursesInCell = parseCourseInfo($cell, day, sections)
            courses.push(...coursesInCell)
        })
    })

    return courses
    
}
