const attachBtn = document.getElementById("attach_btn");
const activateBtn = document.getElementById("activate_btn");
const bindJumpToSpaceBtn = document.getElementById("bindJumpToSpace");

const inputController = new InputController();

var isAttached = false;
var isActive = false;
var isBinded = false;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

attachBtn.addEventListener("click", () => {
    if (isAttached){
        attachBtn.innerHTML = "Аттач к элементу DOM";
        inputController.detach();
        isAttached = false;
    } else {
        attachBtn.innerHTML = "Деттач от элемента DOM";
        inputController.attach(canvas);
        isAttached = true;
    }
});

activateBtn.addEventListener("click", () => {
    if (isActive){
        activateBtn.innerHTML = "Активация контроллера";
        inputController._enabled = false;
        isActive = false;
    } else {
        activateBtn.innerHTML = "Деактивация контроллера";
        inputController._enabled = true;
        isActive = true;
    }
});

bindJumpToSpaceBtn.addEventListener("click", () => {
    if (!isBinded){
        bindJumpToSpaceBtn.innerHTML = "Отвязать доп. активность 'прыжок' от кнопки 'пробел'";
        console.log("bind jump to space");
        inputController.bindActions([{name : "changeColor", keys: ["Space"], enabled : true}]);
        isBinded = true;
    } else{
        bindJumpToSpaceBtn.innerHTML = "Байнд доп. активности 'прыжок' на кнопку 'пробел'";
        console.log("unbind jump to space");
        inputController.bindActions([{name : "changeColor", keys: ["Space"], enabled : false}]);
        isBinded = false;
    }
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

