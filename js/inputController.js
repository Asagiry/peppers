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

        this.bindEvents();
    }

    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            this._actions.set(action.name,{keys: new Set(action.keys), enabled: action.enabled});
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
        this._enabled = !dontEnable;
    }

    detach() {
        this._target = null;
    }

    isActionActive(actionName) {
        if (this._enabled == false) {
            return false;
        }
        console.log(this._enabled)
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


    bindEvents() {
        window.addEventListener("keydown", (e) => {
            this._keys_active.set(e.code, true);
        });
        window.addEventListener("keyup", (e) => {
            this._keys_active.set(e.code, false);
        });
    }


}