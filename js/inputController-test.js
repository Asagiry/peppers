const attachBtn = document.getElementById("attach_btn");
const detachBtn = document.getElementById("detach_btn");
const activateBtn = document.getElementById("activate_btn");
const deactivateBtn = document.getElementById("deactivate_btn");
const bindJumpToSpaceBtn = document.getElementById("bindJumpToSpace");
const unbindJumpToSpaceBtn = document.getElementById("unbindJumpToSpace");

const keyBoardPlugin = new KeyboardPlugin();
const inputController = new InputController(
    null,
    null,
    [keyBoardPlugin]
);
keyBoardPlugin._inputController = inputController;


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

attachBtn.addEventListener("click", () => {
    console.log("Attached to canvas");
    inputController.attach(canvas);
});

detachBtn.addEventListener("click", () => {
    console.log("Detached from canvas");
    inputController.detach();
});

activateBtn.addEventListener("click", () => {
    console.log("Enabled");
    inputController.enabled = true;
});

deactivateBtn.addEventListener("click", () => {
    console.log("Disabled");
    inputController.enabled = false;
});

bindJumpToSpaceBtn.addEventListener("click", () => {
    console.log("bindJumpToSpace");
    inputController.bindActions([{name : "changeColor", keys: ["Space"], enabled : true}]);
});

unbindJumpToSpaceBtn.addEventListener("click", () => {
    console.log("unbindJumpToSpace");
    inputController.bindActions([{name : "changeColor", keys: ["Space"], enabled : false}]);
});

inputController.bindActions([
    {name : "left", keys: ["65", "37"], enabled : true},
    {name : "right", keys: ["68", "39"], enabled : true},
    {name : "up", keys: ["87", "38"], enabled : true},
    {name : "down", keys: ["83", "40"], enabled : true},
    {name : "jump", keys: ["32"], enabled : true}
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
        console.log("changeColor");
        ctx.fillStyle = "blue";
    } else {
        ctx.fillStyle = "red";
    }

    if (inputController.isActionActive("jump")){
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

