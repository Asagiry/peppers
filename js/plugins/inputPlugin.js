/**
 * Abstract class InputPlugin
 * 
 * @class InputPlugin
 */
class InputPlugin{
    _target = null;
    _inputController = null;
    
    _actions = new Map();
    _activeActions = new Map();
    _keys_active = new Map();

    _bindedEvents = {};

    constructor(target = null){
        if(target){
            this._target = target;
        }

        this._bindEvents();
    }

     bindActions(actionsToBind){
        throw new Error("Method bindActions() must be implemented.");
    }


    _bindEvents(){
        throw new Error("Method _bindEvents() must be implemented.");
    }


    addEventListeners(){
        for (const event in this._bindedEvents){
            this._target.addEventListener(event, this._bindedEvents[event.toString()]);
        }
    }

    removeEventListeners(){
        if (!this._target) return;
        for (const event in this._bindedEvents){
            this._target.removeEventListener(event, this._bindedEvents[event.toString()]);
        }
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

    enableAction(actionName){
        this._actions.get(actionName).enabled = true;
    }

    disableAction(actionName){
        this._actions.get(actionName).enabled = false;
    }

    hasAction(actionName){
        return this._actions.has(actionName);
    }

    isActionActive(actionName){
        if (this._inputController._enabled == false || !this._actions.get(actionName)) {
            return false;
        }

        return this._activeActions.get(actionName);
    }

    isKeyPressed(keyCode){
        return this._keys_active.get(keyCode);
    }

    clearActiveActions(){
        this._activeActions.clear();
        this._keys_active.clear();
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

        if (this._inputController.isActionActive(actionName)){
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

                if (!this._inputController.isActionActive(actionName)){
                    return;
                }

                for (const plugin of this._inputController._plugins){
                    if (plugin.isActionActive(actionName) && plugin != this){
                        return;
                    }
                }

                this._target.dispatchEvent(new CustomEvent(InputController.ACTION_DEACTIVATED, {bubbles : true, detail: {actionName: actionName}}));
            }
        }
    }

    //Можно написать лучше хз
    _getActionsNames(key){
        let actionsName = [];
        for (const action of this._actions.values()){
            if (action.keys?.includes(key)){
                actionsName.push(action.name);
            }
        }
        for (const action of this._actions.values()){
            if (action.mouse?.includes(key)){
                actionsName.push(action.name);
            }
        }
        return actionsName;
    }

}
