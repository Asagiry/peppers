import {InputPlugin} from "./inputPlugin.js"

/**
 * Плагин для обработки событий клавиатуры вот ваще идеально выглядит чутка методов и все
 */
export class KeyboardPlugin extends InputPlugin{

    _getDeviceActionsNames(){
        return "keys";
    }

    _mapKey(key){
        return Number(key);
    }

    _fillBindedEvents(){
        return {
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