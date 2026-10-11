(function() {
    function initDraggableSwitcher() {
        const selectors = [
            '.version-switcher', '.version-switcher-bar', '.version-switcher-box',
            '.theme-switcher-deck', '.top-switcher-bar', '#switcher', '#versionSwitcher',
            '.theme-switcher', '.switcher-bar', '.version-deck', '[class*="switcher"]'
        ];
        let el = null;
        for (const sel of selectors) {
            const found = document.querySelector(sel);
            if (found) {
                const pos = getComputedStyle(found).position;
                if (pos === 'fixed' || pos === 'absolute') {
                    el = found;
                    break;
                }
            }
        }
        if (!el) {
            const allFixed = Array.from(document.querySelectorAll('*')).filter(e => {
                const pos = getComputedStyle(e).position;
                const z = parseInt(getComputedStyle(e).zIndex || 0);
                return (pos === 'fixed' || pos === 'absolute') && z >= 90;
            });
            if (allFixed.length > 0) el = allFixed[0];
        }
        if (!el) return;

        // Visual Drag Indicator
        el.style.cursor = 'grab';
        el.style.zIndex = '99999';
        if (!el.querySelector('.drag-handle-hint')) {
            const hint = document.createElement('span');
            hint.className = 'drag-handle-hint';
            hint.innerHTML = ' ⠿ ';
            hint.title = '드래그하여 원하는 위치로 이동하세요';
            hint.style.cssText = 'cursor:grab; font-weight:bold; opacity:0.7; margin-right:6px; user-select:none; display:inline-block; vertical-align:middle;';
            el.insertBefore(hint, el.firstChild);
        }

        let isMouseDown = false;
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;
        let hasMoved = false;

        function startDrag(clientX, clientY) {
            isMouseDown = true;
            hasMoved = false;
            startX = clientX;
            startY = clientY;
            const rect = el.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
            el.style.cursor = 'grabbing';
        }

        function moveDrag(clientX, clientY, e) {
            if (!isMouseDown) return;
            const dx = clientX - startX;
            const dy = clientY - startY;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                hasMoved = true;
                if (e && e.cancelable) e.preventDefault();
                el.style.right = 'auto';
                el.style.bottom = 'auto';
                let newLeft = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, origLeft + dx));
                let newTop = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, origTop + dy));
                el.style.left = newLeft + 'px';
                el.style.top = newTop + 'px';
            }
        }

        function stopDrag() {
            isMouseDown = false;
            el.style.cursor = 'grab';
        }

        el.addEventListener('mousedown', function(e) {
            startDrag(e.clientX, e.clientY);
            function onMouseMove(me) { moveDrag(me.clientX, me.clientY, me); }
            function onMouseUp() {
                stopDrag();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        el.addEventListener('touchstart', function(e) {
            if (!e.touches || e.touches.length === 0) return;
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
            function onTouchMove(te) {
                if (te.touches && te.touches.length > 0) {
                    moveDrag(te.touches[0].clientX, te.touches[0].clientY, te);
                }
            }
            function onTouchEnd() {
                stopDrag();
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
            }
            document.addEventListener('touchmove', onTouchMove, { passive: false });
            document.addEventListener('touchend', onTouchEnd);
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDraggableSwitcher);
    } else {
        initDraggableSwitcher();
    }
})();
