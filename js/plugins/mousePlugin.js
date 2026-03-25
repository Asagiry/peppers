import {InputPlugin} from "./inputPlugin.js"

export class MousePlugin extends InputPlugin{

    _getDeviceActionsNames(){
        return "mouse";
    }

    _mapKey(button){
        switch (button) {
            case "left":
                return 0;
            case "right":
                return 2;
            case "middle":
                return 1;
        }
    }

    _fillBindedEvents(){
        return {       
            mousedown: this._onMouseDown.bind(this),
            mouseup: this._onMouseUp.bind(this)
        }
    }

    
    _onMouseDown(e){
        if (this._keys_active.get(e.button)){
            return;
        } else {
            this._keys_active.set(e.button, true);
        }
        
        for (const actionName of this._getActionsNames(e.button)){
            this._activateAction(actionName);
        }
    }

    _onMouseUp(e){
        if (!this._keys_active.get(e.button)){
            return;
        } else {
            this._keys_active.set(e.button, false);
        }

        for (const actionName of this._getActionsNames(e.button)){
            this._deactivateAction(actionName);
        }
    }
}