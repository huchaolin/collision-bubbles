/**
 * @file index.js 
 * @author 胡朝林 <715421045@qq.com>
 */
(function () {
    class Bubble {
        constructor(x, y, r, vx = 1, vy = 1) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.vx = vx;
            this.vy = vy;
            this.view = null;
        }
    }

    const panel = document.querySelector('#panel');
    const game = {
        view: {
            panel
        },
        config: {
            width: 600,
            height: 300,
            bubbleNum: 12,
            minRadius: 20,
            maxRadius: 50,
            controlBubbleClass: 'red_bubble',
            bubbleClass: 'blue_bubble'
        },
        controlBubble: null,
        bubbles: [],
        // 生成蓝色泡泡与红泡泡
        createBubbles() {
            const {width, height, bubbleNum, minRadius, maxRadius} = this.config;
            for (let i = 0; i < bubbleNum; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const r = Math.random() * (maxRadius - minRadius) + minRadius;
                const bubble = new Bubble(x, y, r);
                bubble.vx = Math.pow(-1, parseInt(Math.random() * 100, 10)) * (Math.random() * 0.8 + 1);
                bubble.vy = Math.pow(-1, parseInt(Math.random() * 100, 10)) * (Math.random() * 0.8 + 1);
                this.bubbles.push(bubble);
            }
            this.controlBubble = new Bubble(width / 2, height / 2, 50);
            this.controlBubble.id = 'controller';
            this.controlBubble.vx = Math.pow(-1, parseInt(Math.random() * 100, 10)) * (Math.random() * 0.8 + 1);
            this.controlBubble.vy = Math.pow(-1, parseInt(Math.random() * 100, 10)) * (Math.random() * 0.8 + 1);
        },
        // 初始化蓝泡泡与红泡泡dom
        initialDom() {
            const frag = document.createDocumentFragment();
            this.bubbles.concat(this.controlBubble).forEach(bubble => {
                const div = document.createElement('div');
                div.style.left = bubble.x - bubble.r + 'px';
                div.style.top = bubble.y - bubble.r + 'px';
                div.style.width = bubble.r * 2 + 'px';
                div.style.height = bubble.r * 2 + 'px';
                div.className = this.config.bubbleClass;
                bubble.view = div;
                frag.appendChild(div);
            });
            this.controlBubble.view.className = this.config.controlBubbleClass;
            this.view.panel.style.width = this.config.width + 'px';
            this.view.panel.style.height = this.config.height + 'px';
            this.view.panel.appendChild(frag);
        },
        // 初始化页面
        init() {
            this.createBubbles();
            this.initialDom();
            this.mouseMoveBubble = this.mouseMoveBubble.bind(this);
            this.render = this.render.bind(this);
            this.render();
            this.mouseMoveBubble();
        },
        // 处理两球碰撞,改变其运动速度和碰撞的位置
        handleCollision(bubble1, bubble2) {
            let {x: x1, y: y1, r: r1, vx: vx1, vy: vy1} = bubble1;
            let {x: x2, y: y2, r: r2, vx: vx2, vy: vy2} = bubble2;
            const minDistance = r1 + r2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const pow2 = value => Math.pow(value, 2);
            const limitV = (v1, v) => (v1 > v ? v1 - v : (v1 < -v ? v1 + v : v1));
            if (pow2(dx) + pow2(dy) < pow2(minDistance)) {
                // 假设碰撞后球会按原方向继续做一定的运动，将其定义为运动A
                const angle = Math.atan2(dy, dx);
                // 当刚好相碰，即distance=minDistance时，tx=x2, ty=y2
                const tx = x1 + Math.cos(angle) * minDistance;
                const ty = y1 + Math.sin(angle) * minDistance;
                // 产生运动A后，tx > x2, ty > y2,所以用ax、ay记录的是运动A的值 ,0.2为设置的弹力系数
                const ax = (tx - x2) * 0.2;
                const ay = (ty - y2) * 0.2;
                // 碰撞之后让他们马上复原到碰撞时候的位置
                if (bubble1.id !== 'controller') {
                    bubble1.x = x1 - ax;
                    bubble1.y = y1 - ay;
                }
                if (bubble2.id !== 'controller') {
                    bubble2.x = x2 + ay;
                    bubble2.y = y2 + ay;
                }
                // 一个球减去ax、ay，另一个加上它，则实现反弹
                vx1 -= ax;
                vy1 -= ay;
                vx2 += ax;
                vy2 += ay;
                // 判断速度是否过快,过快手动减速
                bubble1.vx = limitV(vx1, 5);
                bubble1.vy = limitV(vy1, 5);
                bubble2.vx = limitV(vx2, 5);
                bubble2.vy = limitV(vy2, 5);
            }
        },
        // 处理蓝泡泡移动与碰撞
        moveBubbles() {
            const {width, height} = this.config;
            this.bubbles.forEach((bubble, index) => {
                this.bubbles.slice(index + 1).forEach(bubble2 => {
                    this.handleCollision(bubble, bubble2);
                });
                let {x, y, r, vx, vy} = bubble;
                x += vx;
                y += vy;
                x = x <= -r ? (width + r) : (x >= width + r ? -r : x);
                y = y <= -r ? (height + r) : (y >= height + r ? -r : y);
                bubble.x = x;
                bubble.y = y;
            });
        },
        // 处理红泡泡移动以及与蓝泡泡碰撞
        moveControlBubble(mouseX, mouseY) {
            const {width, height} = this.config;
            let {x, y, r, vx, vy} = this.controlBubble;
            if (!mouseX && !this.hovering) {
                x += vx;
                y += vy;
            }
            x = x <= r ? r : (x >= width - r ? width - r : x);
            y = y <= r ? r : (y >= height - r ? height - r : y);
            this.controlBubble.x = mouseX || x;
            this.controlBubble.y = mouseY || y;
            this.bubbles.forEach(bubble2 => {
                this.handleCollision(this.controlBubble, bubble2);
            });
        },
        // 鼠标移动时,红泡泡如何移动
        mouseMoveBubble() {
            const panel = this.view.panel;
            function handlerMoveIn(e) {
                this.moveControlBubble(e.clientX - panel.offsetLeft, e.clientY - panel.offsetTop);
            }
            panel.addEventListener('mousemove', handlerMoveIn.bind(this), false);
            panel.addEventListener('mouseenter', () => this.hovering = true, false);
            panel.addEventListener('mouseleave', () => this.hovering = false, false);
        },
        // 渲染到真实节点
        render() {
            this.moveBubbles();
            this.moveControlBubble();
            this.bubbles.forEach(bubble => {
                bubble.view.style.left = bubble.x - bubble.r + 'px';
                bubble.view.style.top = bubble.y - bubble.r + 'px';
            });
            const {x, y, r} = this.controlBubble;
            this.controlBubble.view.style.left = x - r + 'px';
            this.controlBubble.view.style.top = y - r  + 'px';
            requestAnimationFrame(this.render);
        }
    };
    game.init();
})();
