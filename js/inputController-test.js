const attachBtn = document.getElementById("attach_btn");
const detachBtn = document.getElementById("detach_btn");
const activateBtn = document.getElementById("activate_btn");
const deactivateBtn = document.getElementById("deactivate_btn");
const bindJumpToSpaceBtn = document.getElementById("bindJumpToSpace");
const unbindJumpToSpaceBtn = document.getElementById("unbindJumpToSpace");

const inputController = new InputController();

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

attachBtn.addEventListener("click", () => {
    addLog("Attached to canvas");
    inputController.attach(canvas);
});

detachBtn.addEventListener("click", () => {
    addLog("Detached from canvas");
    inputController.detach();
});

activateBtn.addEventListener("click", () => {
    addLog("Enabled");
    inputController.enabled = true;
});

deactivateBtn.addEventListener("click", () => {
    addLog("Disabled");
    inputController.enabled = false;
});

bindJumpToSpaceBtn.addEventListener("click", () => {
    addLog("bindJumpToSpace");
    inputController.bindActions([{name : "changeColor", keys: ["Space"], enabled : true}]);
});

unbindJumpToSpaceBtn.addEventListener("click", () => {
    addLog("unbindJumpToSpace");
    inputController.bindActions([{name : "changeColor", keys: ["Space"], enabled : false}]);
});

inputController.bindActions([
    {name : "left", keys: ["ArrowLeft", "KeyA"], enabled : true},
    {name : "right", keys: ["ArrowRight", "KeyD"], enabled : true},
    {name : "up", keys: ["ArrowUp", "KeyW"], enabled : true},
    {name : "down", keys: ["ArrowDown", "KeyS"], enabled : true},
    {name : "jump", keys: ["Space"], enabled : true}
]);


function gameLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleJump();

    handleMovement();

    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();

var x = canvas.width / 2;
var y = canvas.height / 2;

function draw(){
    var circle = new Path2D();
    circle.arc(x, y, 25, 0, 2 * Math.PI);
    ctx.fill(circle);
}

function handleMovement(){
    if (inputController.isActionActive("left")){
        x -= 1;
    }
    if (inputController.isActionActive("right")){
        x += 1;
    }
    if (inputController.isActionActive("up")){
        y -= 1;
    }
    if (inputController.isActionActive("down")){
        y += 1;
    }
}

function handleJump(){
    if (inputController.isActionActive("changeColor")){
        addLog("changeColor");
        ctx.fillStyle = "blue";
    } else {
        ctx.fillStyle = "red";
    }

    if (inputController.isActionActive("jump")){
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.stroke();
    }
}


function addLog(message){
    let theDate = new Date(Date.now());
    let dateString = theDate.toGMTString();

    const log = document.createElement("span");
    log.textContent = message + " " + dateString;
    document.getElementById("log_text").appendChild(log);
    document.getElementById("log_text").scrollTop = document.getElementById("log_text").scrollHeight;
}

