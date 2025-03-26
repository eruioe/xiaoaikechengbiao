async function scheduleHtmlProvider() {
    await loadTool('AIScheduleTools');
    
    // 直接获取 table 元素
    const sch = document.querySelector('#kbtable');
    
    if (!sch) {
        await AIScheduleAlert({
            titleText: '获取课表失败',
            contentText: '请确保你已经打开课表页面',
            confirmText: '确认'
        });
        return 'do not continue';
    }
    
    // 返回处理后的HTML
    return sch.outerHTML.replace(/\n/g, '').replace(/\s+/g, ' ');
    

}