/*
Вторая часть: добавить логику, чтобы к контроллеру можно было подключать плагины: 
типа ввода (клавиатуру, мышь), 
Плагины в свою очередь берут из настроек экшена самостоятельно параметры и решают активен экшен или нет
*/

class KeyboardPlugin{
    

    _target = null;
    _inputController = null;
    
    _actions = new Map();
    _activeActions = new Map();
    _keys_active = new Map();

    _bindedKeyDown = this._onKeyDown.bind(this);
    _bindedKeyUp = this._onKeyUp.bind(this);
    
    constructor(target = null){
        if(target){
            this._target = target;
        }
    }


    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            let keys = [];

            for (const key of action.keys){
                keys.push(Number(key));
            }

            if (this._actions.has(action.name)){
                this._actions.get(action.name).keys.add(...keys);
            } 

            else {
                this._actions.set(action.name, {name: action.name, keys: keys, enabled: action.enabled});
            }
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

    addEventListeners(){
        this._target.addEventListener("keydown", this._bindedKeyDown);
        this._target.addEventListener("keyup", this._bindedKeyUp);
    }

    removeEventListeners(){
        if (!this._target){
            return;
        }
        this._target.removeEventListener("keydown", this._bindedKeyDown);
        this._target.removeEventListener("keyup", this._bindedKeyUp);
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


    _onKeyDown(e){
        if (this._keys_active.get(e.keyCode)){
            return;
        } else {
            this._keys_active.set(e.keyCode, true);
        }

        for (const actionName of this._getActionsNames(e.keyCode)){
            this._activateAction(actionName);
        }
    }

    _onKeyUp(e){
        if (!this._keys_active.get(e.keyCode)){
            return;
        } else {
            this._keys_active.set(e.keyCode, false);
        }

        for (const actionName of this._getActionsNames(e.keyCode)){
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
            if (action.keys.includes(key)){
                actionsName.push(action.name);
            }
        }
        return actionsName;
    }






    
    






}