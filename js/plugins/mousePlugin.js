class MousePlugin{
    
    target = null;
    _inputController = null;
    
    _actions = new Map();
    _activeActions = new Map();
    _keys_active = new Map();

    _bindedMouseDown = this._onMouseDown.bind(this);
    _bindedMouseUp = this._onMouseUp.bind(this);

    constructor(target = null){
        if(target){
            this._target = target;
        }
    }

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
                this._actions.get(action.name).mouse.add(...mouse_buttons);
            } 

            else {
                this._actions.set(action.name, {name: action.name, mouse: mouse_buttons, enabled: action.enabled});
            }
        }
        console.log(this._actions)
    }

    attach(target){
        this.detach();

        this._target = target;

        this.addEventListeners();
    }

    detach(){
        this.removeEventListeners();

        this._activeActions.clear();
        this._keys_active.clear();
        this._target = null;
    }

    addEventListeners(){
        this._target.addEventListener("mousedown", this._bindedMouseDown);
        this._target.addEventListener("mouseup", this._bindedMouseUp);
    }

    removeEventListeners(){
        if (!this._target){
            return;
        }

        this._target.removeEventListener("mousedown", this._bindedMouseDown);
        this._target.removeEventListener("mouseup", this._bindedMouseUp);
    }

    isActionActive(actionName) {
        return this._activeActions.get(actionName);
    }

    isKeyPressed(mouseCode) {
        return this._keys_active.get(mouseCode);
    }

    hasAction(actionName) {
        return this._actions.has(actionName);
    }

    enableAction(actionName){
        this._actions.get(actionName).enabled = true;
    }

    disableAction(actionName) {
        if (this._actions.get(actionName)){
            this._actions.get(actionName).enabled = false;
        }
    }

    _onMouseDown(e){
        if (this._keys_active.get(e.button)){
            return;
        } else {
            this._keys_active.set(e.button, true);
        }

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

    _activateAction(actionName){
        if (!this._actions.get(actionName).enabled){
            return;
        }

        if (this._activeActions.get(actionName)){
            this._activeActions.set(actionName, this._activeActions.get(actionName) + 1);
            return;
        } 
        
        this._activeActions.set(actionName, 1);

        if (inputController.isActionActive(actionName)){
            return;
        }

        this._target.dispatchEvent(new CustomEvent(InputController.ACTION_ACTIVATED, {bubbles : true, detail: {actionName: actionName}}));
        
    }

    _deactivateAction(actionName){
        if (!this._actions.get(actionName).enabled){
            return;
        }

        if (this._activeActions.get(actionName)){
            this._activeActions.set(actionName, this._activeActions.get(actionName) - 1);
            if (this._activeActions.get(actionName) == 0){

                if (!inputController.isActionActive(actionName)){
                    return;
                }

                if (inputController.plugins.some((plugin) => plugin.isActionActive(actionName) && plugin !== this)){
                    return;
                }

                this._target.dispatchEvent(new CustomEvent(InputController.ACTION_DEACTIVATED, {bubbles : true, detail: {actionName: actionName}}));
            }
        }
    }

    _getActionsNames(key){
        let actionsName = [];
        for (const action of this._actions.values()){
            if (action.mouse.includes(key)){
                actionsName.push(action.name);
            }
        }
        return actionsName;
    }
    

}