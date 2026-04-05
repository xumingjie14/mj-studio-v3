        setTimeout(() => {
            panel.style.transform = 'translateY(-2px)';
            panel.style.boxShadow = '0 8px 25px rgba(255, 107, 0, 0.2)';
        }, 200);
    }
    
    // 处理警报点击
    handleAlertClick(alertElement) {
        const alertId = alertElement.dataset.id;
        console.log('警报点击:', alertId);
        
        // 添加点击反馈
        alertElement.style.opacity = '0.8';
        setTimeout(() => {
            alertElement.style.opacity = '1';
        }, 200);
        
        // 这里可以添加警报详情查看逻辑
    }
    
    // 显示错误消息
    showErrorMessage(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-alert warning';
        errorDiv.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">系统提示</div>
                <div class="alert-message">${message}</div>
            </div>
        `;
        
        // 插入到页面
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            
            // 5秒后自动移除
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
    
    // 标记系统就绪
    markSystemReady() {
        document.body.classList.add('system-ready');
        
        // 添加就绪动画
        const panels = document.querySelectorAll('.panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                panel.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        console.log('✅ 系统就绪，所有功能已加载');
    }
    
    // 手动刷新数据
    refreshData() {
        console.log('手动刷新数据...');
        this.loadAllData();
        
        // 显示刷新提示
        this.showErrorMessage('正在刷新数据...');
    }
}

// 应用初始化
window.addEventListener('DOMContentLoaded', () => {
    // 创建全局实例
    window.logosSentinel = new LogosSentinel();
    
    // 添加全局刷新快捷键 (Ctrl+R 或 Cmd+R)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            window.logosSentinel.refreshData();
        }
    });
    
    // 添加右键菜单刷新选项
    document.addEventListener('contextmenu', (e) => {
        // 可以在这里添加上下文菜单
    }, false);
});

// 导出全局函数
window.refreshLogosData = function() {
    if (window.logosSentinel) {
        window.logosSentinel.refreshData();
    }
};

// 系统信息
console.log('⚙️ MJ工作室 · Logos哨兵终端 v2.0');
console.log('📊 宏观流动性监控系统');
console.log('🚀 技术栈: Vanilla JS + Vercel Serverless');
console.log('🌐 部署平台: Vercel');
console.log('© 2026 MJ工作室 · 数据驱动决策');