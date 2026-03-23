class InputController {
    static get ACTION_ACTIVATED() { return "input-controller:activate" };
    static get ACTION_DEACTIVATED() { return "input-controller:deactivate" };

    _enabled = false;
    _focused = true;
    _keys_active = new Map();
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
            this._actions.set(action.name, { keys: new Set(action.keys), enabled: action.enabled });
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
    }

    detach() {
        this._target = null;
    }

    isActionActive(actionName) {
        if (this._enabled == false) {
            return false;
        }
        if (!this._actions.get(actionName)) {
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


    _bindEvents() {
        window.addEventListener("keydown", (e) => {
            this._keys_active.set(e.code, true);
            if (this._target) {
               for (const action of this._actions.values()){
                   if (action.keys.has(e.code) && action.enabled){
                       this._target.dispatchEvent(new CustomEvent(InputController.ACTION_ACTIVATED, { detail: action.name }));
                   }
               }
            }
        });
        window.addEventListener("keyup", (e) => {
            this._keys_active.set(e.code, false);
            if (this._target) {
                for (const action of this._actions.values()){
                   if (action.keys.has(e.code) && action.enabled){
                       this._target.dispatchEvent(new CustomEvent(InputController.ACTION_ACTIVATED, { detail: action.name }));
                   }
               }
            }
        });
    }


}