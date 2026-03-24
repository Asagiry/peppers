class InputController {

    static ACTION_ACTIVATED = "input-controller:action-activated";
    static ACTION_DEACTIVATED = "input-controller:action-deactivated";

    get enabled() {return this._enabled;}
    set enabled(value) {this._enabled = value;}

    get focused() {return this._focused;}
    set focused(value) {this._focused = value;}

    get plugins() {return this._plugins;}


    _actions = new Map();
    _activeActions = new Map();

    _plugins = {};

    _bindedOnFocus;
    _bindedOnBlur;

    _bindedOnActionActivated;
    _bindedOnActionDeactivated;


    constructor(actionsToBind = [], target = null, plugins = []) {
        this._enabled = false;
        this._plugins = plugins;

        if (target) {
            this.attach(target);

            
        }

        if (actionsToBind) {
            this.bindActions(actionsToBind);
        }

        return this;
    }


    bindActions(actionsToBind) {
        for (const plugin of this._plugins){
            plugin.bindActions(actionsToBind);
        }

    }

    enableAction(actionName) {
        for (const plugin of this._plugins){

            if (plugin.hasAction(actionName)){
                plugin.enableAction(actionName);
            }

        }
    }

    disableAction(actionName) {
        for (const plugin of this._plugins){

            if (plugin.hasAction(actionName)){
                plugin.disableAction(actionName);
            }

        }
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

        for (const plugin of this._plugins){
            plugin.attach(target);
        }

        this._createActionEvents();

        this._addTargetEvents();
    }

    detach() {
        if (!this._target){
            return;
        }

        this._enabled = false;

        for (const plugin of this._plugins){
            plugin.detach();
        }

        this._removeTargetEvents();

        this._target = null;
        this._activeActions = null;

        this._bindedOnBlur = null;
        this._bindedOnFocus = null;

        this._bindedOnActionActivated = null;
        this._bindedOnActionDeactivated = null;
    }

    _createActionEvents(){
        this._bindedOnActionActivated = this._onActionActivated.bind(this);
        this._bindedOnActionDeactivated = this._onActionDeactivated.bind(this);
    }

    _onActionActivated(e){
        this._activeActions.set(e.detail.actionName, true);
    }

    _onActionDeactivated(e){
        this._activeActions.set(e.detail.actionName, false);
    }


    _addTargetEvents(){
        this._bindedOnFocus = this._onFocus.bind(this);
        this._bindedOnBlur = this._onBlur.bind(this);

        this._target.addEventListener("focus", this._bindedOnFocus);
        this._target.addEventListener("blur", this._bindedOnBlur);

        this._target.addEventListener(InputController.ACTION_ACTIVATED, this._bindedOnActionActivated);
        this._target.addEventListener(InputController.ACTION_DEACTIVATED, this._bindedOnActionDeactivated);
    }

    _removeTargetEvents(){
        this._target.removeEventListener("focus", this._bindedOnFocus);
        this._target.removeEventListener("blur", this._bindedOnBlur);

        this._target.removeEventListener(InputController.ACTION_ACTIVATED, this._bindedOnActionActivated);
        this._target.removeEventListener(InputController.ACTION_DEACTIVATED, this._bindedOnActionDeactivated);
    }

    isActionActive(actionName) {
        return this._activeActions.get(actionName);
    }

    isKeyPressed(keyCode) {
        for (const plugin of this._plugins){
            return plugin.isKeyPressed(keyCode);
        }
    }

    
    _onFocus(e){
       this._focused = true; 
    }

    _onBlur(e){
        this._focused = false;
        this._activeActions.clear();
        for (const plugin of this._plugins){
            plugin.clearActiveActions();
        }
    }


}

