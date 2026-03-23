class InputController {
    static get ACTION_ACTIVATED() { return "input-controller:activate" };
    static get ACTION_DEACTIVATED() { return "input-controller:deactivate" };

    _enabled = false;
    _focused = true;
    _keys_active = new Map();
    _actions_active = new Map();
    _actions = new Map();

    constructor(actionsToBind = [], target = null) {
        if (actionsToBind) {
            this.bindActions(actionsToBind);
        }
        if (target) {
            this.attach(target);
        }

        this._bindEvents();
    }

    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            this._actions.set(action.name, { keys: new Set(action.keys), enabled: action.enabled, name: action.name});
        }
    }

    enableAction(actionName) {
        this._actions.get(actionName).enabled = true;
    }

    disableAction(actionName) {
        this._actions.get(actionName).enabled = false;
    }

    attach(target, dontEnable = true) {
        this._target = target;
        if (dontEnable == false) {
            this._enabled = true;
        }

        this._target.addEventListener("keydown", this._onKeyDown);
        this._target.addEventListener("keyup", this._onKeyUp);
    }

    detach() {
        this._target.removeEventListener("keydown", this._onKeyDown);
        this._target.removeEventListener("keyup", this._onKeyUp);;
        this._target = null;
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
        if (this._enabled == false) {
            return;
        }
        this._keys_active.set(e.code, true);

        let actionName = this._getActionName(e.code);
        if (this._actions_active.get(actionName)){
            this._actions_active.set(actionName, this._actions_active.get(actionName) + 1);
        } else {
            this._actions_active.set(actionName, 1);
        }

        this._addActionActivated(e);
    }

    _onKeyUp(e){
        if (this._enabled == false) {
            return;
        }
        this._keys_active.set(e.code, false);

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

    _bindEvents() {
        this._addFocusEvents();
        this._addKeyEvents();
    }

    _addFocusEvents(){
        window.addEventListener("focus", () => {
            this._focused = true;
        });
        window.addEventListener("blur", () => {
            this._focused = false;
        });
    }

    _addKeyEvents(){
        window.addEventListener("keydown", (e) => {
            this._onKeyDown(e);
        });
        window.addEventListener("keyup", (e) => {
            this._onKeyUp(e);
        });
    }




}