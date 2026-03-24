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
            this._target.removeEventListener(event, this._bindedEvents.event);
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
        if (this._enabled == false || !this._actions.get(actionName)) {
            return false;
        }
        for (const action of this._activeActions.values()){
            if (action.name === actionName){
                return true;
            }
        }
        return false;
    }

    isKeyPressed(keyCode){
        return this._keys_active.get(keyCode);
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

                console.log(this,actionName)

                if (!inputController.isActionActive(actionName)){
                    return;
                }


                for (const plugin of inputController._plugins){
                    
                    //Надо фиксить
                    console.log(plugin._activeActions, actionName, plugin.isActionActive(actionName))
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
