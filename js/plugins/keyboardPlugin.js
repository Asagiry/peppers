/*
Вторая часть: добавить логику, чтобы к контроллеру можно было подключать плагины: 
типа ввода (клавиатуру, мышь), 
Плагины в свою очередь берут из настроек экшена самостоятельно параметры и решают активен экшен или нет
*/

class KeyboardPlugin extends InputPlugin{

    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            let keys = [];

            if (!action.keys) 
                continue;

            for (const key of action.keys){
                keys.push(Number(key));
            }

            if (this._actions.has(action.name)){
                keys.forEach(key => {
                    if (!this._actions.get(action.name).keys.includes(key)){
                        this._actions.get(action.name).keys.push(key)
                    }
                });

                this._actions.get(action.name).enabled = action.enabled;
                
            } 

            else {
                this._actions.set(action.name, {name: action.name, keys: keys, enabled: action.enabled});
            }
        }
    }

    _bindEvents(){
        this._bindedEvents = {
            keydown:  this._onKeyDown.bind(this),
            keyup : this._onKeyUp.bind(this)
        }
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

}