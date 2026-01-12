const firebaseConfig = { databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const mCanvas = document.getElementById('mainCanvas');
const fCanvas = document.getElementById('fireCanvas');
const mCtx = mCanvas.getContext('2d');
const fCtx = fCanvas.getContext('2d');

mCanvas.width = fCanvas.width = 10000;
mCanvas.height = fCanvas.height = 10000;

let scale = 0.15;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

function updateTransform() {
    const transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    mCanvas.style.transform = transform;
    fCanvas.style.transform = transform;
}
updateTransform();

// জুম লজিক (মাউস হুইল)
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) scale = Math.min(scale + zoomSpeed, 2);
    else scale = Math.max(scale - zoomSpeed, 0.05);
    updateTransform();
}, { passive: false });

// নাড়াচাড়া করার লজিক (Drag to Pan)
window.onmousedown = (e) => { isDragging = true; startX = e.clientX - offsetX; startY = e.clientY - offsetY; };
window.onmouseup = () => isDragging = false;
window.onmousemove = (e) => {
    if (isDragging) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        updateTransform();
    }
    // ফায়ার ইফেক্ট
    const rect = mCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    createFire(x, y);
};

let particles = [];
function createFire(x, y) {
    for(let i=0; i<5; i++) particles.push({x, y, vx:(Math.random()-0.5)*10, vy:(Math.random()-0.5)*10, life:20});
}

function animate() {
    fCtx.clearRect(0,0,10000,10000);
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        fCtx.fillStyle = `rgba(0, 255, 204, ${p.life/20})`;
        fCtx.fillRect(p.x, p.y, 20, 20);
        if(p.life <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(animate);
}
animate();

// ডাটাবেস থেকে ছবি লোড
db.ref('pixels').on('value', snap => {
    const data = snap.val() || {};
    Object.keys(data).forEach(id => {
        let p = data[id];
        let img = new Image(); img.src = p.imageUrl;
        img.onload = () => mCtx.drawImage(img, ((id-1)%160)*200, Math.floor((id-1)/160)*200, 200, 200);
    });
});
