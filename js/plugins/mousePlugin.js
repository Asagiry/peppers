class MousePlugin extends InputPlugin{

    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            let mouse_buttons = [];

            if (!action.mouse){
                continue;
            }

            for (const button of action.mouse){
                switch (button) {
                    case "left":
                        mouse_buttons.push(0);
                        break;
                    case "right":
                        mouse_buttons.push(2);
                        break;
                    case "middle":
                        mouse_buttons.push(1);
                        break;
                    default:
                        break;
                }
            }

            if (this._actions.has(action.name)){
                mouse_buttons.forEach(button => {
                    if (!this._actions.get(action.name).mouse.includes(button)){
                        this._actions.get(action.name).mouse.push(button)
                    }
                });
                
            } 

            else {
                this._actions.set(action.name, {name: action.name, mouse: mouse_buttons, enabled: action.enabled});
            }
        }
    }

    _bindEvents(){
        this._bindedEvents = {       
            mousedown: this._onMouseDown.bind(this),
            mouseup: this._onMouseUp.bind(this)
        }
    }

    
    _onMouseDown(e){
        if (this._keys_active.get(e.button)){
            return;
        } else {
            this._keys_active.set(e.button, true);
        }

        console.log(this._getActionsNames(e.button));
        for (const actionName of this._getActionsNames(e.button)){
            this._activateAction(actionName);
        }
    }

    _onMouseUp(e){
        if (!this._keys_active.get(e.button)){
            return;
        } else {
            this._keys_active.set(e.button, false);
        }

        for (const actionName of this._getActionsNames(e.button)){
            this._deactivateAction(actionName);
        }
    }
}