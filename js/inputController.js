class InputController {

    //#region Точно верно.

    static get ACTION_ACTIVATED() { return "input-controller:action-activated" };
    static get ACTION_DEACTIVATED() { return "input-controller:action-deactivated" };

    get enabled() {return this._enabled;}
    set enabled(value) {this._enabled = value;}

    get focused() {return this._focused;}
    set focused(value) {this._focused = value;}


    _actions_active = new Map();
    _actions = new Map();
    _keys_active = new Map();

    _bindedOnKeyDown = this._onKeyDown.bind(this);
    _bindedOnKeyUp = this._onKeyUp.bind(this);

    _bindedOnFocus;
    _bindedOnBlur;
    //#endregion Точно верно.


    //#region Точно верно.
    constructor(actionsToBind = [], target = null) {
        this._enabled = false;

        if (actionsToBind) {
            this.bindActions(actionsToBind);
        }
        if (target) {
            this.attach(target);
        }
        return this;
    }
    //#endregion Точно верно.


    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            this._actions.set(action.name, {name: action.name, keys: new Set(action.keys), enabled: action.enabled});
        }
    }

    enableAction(actionName) {
        this._actions.get(actionName).enabled = true;
    }

    disableAction(actionName) {
        this._actions.get(actionName).enabled = false;
    }

    

    attach(target, dontEnable = true) {
        if (this._target === target){
            return;
        }
        
        if (this._target){
            this.detach();
        }

        this._target = target;
        this._target.focus();

        if (dontEnable == false) {
            this._enabled = true;
        }


        this._addTargetEvents();

    }

    _addTargetEvents(){
        this._bindedOnFocus = this._onFocus.bind(this);
        this._bindedOnBlur = this._onBlur.bind(this);

        this._target.addEventListener("focus", this._bindedOnFocus);
        this._target.addEventListener("blur", this._bindedOnBlur);

        this._target.addEventListener("keydown", this._bindedOnKeyDown);
        this._target.addEventListener("keyup", this._bindedOnKeyUp);
    }

    detach() {
        if (!this._target){
            return;
        }

        this._target.removeEventListener("focus", this._bindedOnFocus);
        this._target.removeEventListener("blur", this._bindedOnBlur);

        this._target.removeEventListener("keydown", this._bindedOnKeyDown);
        this._target.removeEventListener("keyup", this._bindedOnKeyUp);

        this._target = null;

        this._actions_active.clear();
        this._keys_active.clear();

        this._bindedOnBlur = null;
        this._bindedOnFocus = null;
    }

    isActionActive(actionName) {
        if (this._enabled == false || !this._actions.get(actionName)) {
            return false;
        }
        for (const key of this._actions.get(actionName).keys) {
            if (this._keys_active.get(key) && this._actions.get(actionName).enabled) {
                return true;
            }
        }
        return false;
    }

    isKeyPressed(keyCode) {
        return this._keys_active.get(keyCode);
    }

    _onKeyDown(e){
        if (this._enabled == false || this._focused == false) {
            return;
        }

        if(this._keys_active){
            this._keys_active.set(e.code, true);
        }

        let actionName = this._getActionName(e.code);
        if (this._actions_active.get(actionName)){
            this._actions_active.set(actionName, this._actions_active.get(actionName) + 1);
        } else {
            this._actions_active.set(actionName, 1);
        }

        this._addActionActivated(e);
    }

    _onKeyUp(e){
        if (this._enabled == false || this._focused == false) {
            return;
        }

        if(this._keys_active){
            this._keys_active.set(e.code, false);
        }

        let actionName = this._getActionName(e.code);
        if (this._actions_active.get(actionName)){
            this._actions_active.set(actionName, this._actions_active.get(actionName) - 1);
        }

        this._addActionDeactivated(e);
    }

     _getActionName(key){
        for (const action of this._actions.values()){
            if (action.keys.has(key)){
                return action.name;
            }
        }
        return null;
    }


     _addActionActivated(e){
        if (this._target) {
            for (const action of this._actions.values())
            {
                if (action.keys.has(e.code) && action.enabled)
                {
                    if (this._actions_active.get(action.name) == 1){
                        this._target.dispatchEvent(new CustomEvent(InputController.ACTION_ACTIVATED, { detail: action.name }));
                        console.log("action activated", action.name);
                    }
                }
            }
        }
    }

    _addActionDeactivated(e){
        if (this._target) {
            for (const action of this._actions.values()){
                if (action.keys.has(e.code) && action.enabled)
                {
                    if (this._actions_active.get(action.name) == 0){
                        this._target.dispatchEvent(new CustomEvent(InputController.ACTION_DEACTIVATED, { detail: action.name }));
                        console.log("action deactivated", action.name);
                    }
                }
            }
        }
    }

    
    _onFocus(e){
       this._focused = true; 
    }

    _onBlur(e){
        this._focused = false;
        this._keys_active.clear();
        this._actions_active.clear();
    }

}


//keydown срёт событиями,
//джамп срет событиями. 