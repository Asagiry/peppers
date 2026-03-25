import {ACTION_ACTIVATED, ACTION_DEACTIVATED} from "../const.js";

/**
 * Абстрактный класс InputPlugin
 * @class InputPlugin
 */
export class InputPlugin{

    //#region MUST_BE_IMPLEMENTED

    /**
     * Заполняет BindedEvents
     * 
     * _bindedEvents - это объект, который содержит в себе ивенты, которые будут привязаны к таргету
     * формат такой {EventName : EventCallback,.....}
     * Которые будут вызваны при нажатии одного из action.keys или action.mouse или action.dancePad.............
     * @returns {Object}
     */
    _fillBindedEvents(){
        throw new Error("Method _fillBindedEvents() must be implemented.");
        // return 
        // {
        //  "keydown": this._onKeyDown.bind(this),
        //  "keyup": this._onKeyUp.bind(this)
        // }
    }

    /**
     * Возвращает название устройства ввода(Которое определено по ТЗ и будет передаваться как поле у экшенов, типа "keys", "mouse", "dancePad" и т.д.)
     * @returns {string}
     */
    _getDeviceActionsNames(){
        throw new Error("Method _getDeviceActionsNames() must be implemented.");
    }

    /**
     * Маппит кнопку на код
     * @param {Number} code Код кнопки, для клавиатуры например KeyA -> 65 условно такой маппинг, или left -> 0 для мыши
     * @returns {number}
     */
    _mapKey(code){
        throw new Error("Method _mapKey() must be implemented.");
    }

    //#endregion

    //#region GettersSetters

    get inputController() {return this._inputController;}
    set inputController(value) {this._inputController = value;}

    //#endregion

    //#region PrivateFields

    _inputController = null;
    _target = null;
    _actions = new Map();
    _activeActions = new Map();
    _keys_active = new Map();

    _bindedEvents = {};

    //#endregion

    /**
     * Конструктор который автоматически создает биндед ивенты(которые отслеживают нажатия девайса)
     */
    constructor(){
        this._bindedEvents = this._guardEvents(this._fillBindedEvents());
    }

    /**
     * Защищает ивенты от вызова если инпут контроллер выключен чтобы в каждом наследнике не писать if (!this._inputController.enabled) return;
     */
    _guardEvents(events){
        const guardedEvents = {};
        for (const [eventName, handler] of Object.entries(events)){
            guardedEvents[eventName] = (event) => {
                if (!this._inputController.enabled) return;
                if (!this._inputController.focused) return;
                handler(event);
            }
        }
        return guardedEvents;
    }

    /**
     * Связывает экшены с плагином
     * @param {Array<Object>} actionsToBind Массив экшенов для связывания
     */
    bindActions(actionsToBind) {
        for (const action of actionsToBind) {
            this._bindAction(action);
        }
    }

    /**
     * Связывает экшен с плагином
     * @param {Object} actionObject Экшен для связывания формат вот такой 
     * {
     *  "left": { // название активности
     *      plugin._getDeviceActionsNames(): [37,65], // список кодов кнопок соответствующих активности
     *      enabled: false // отключенная активность
     *  }
     * }
     */
    _bindAction(actionObject){
        if (!actionObject[this._getDeviceActionsNames()]) return;

        let keys = [];

        for (const key of actionObject[this._getDeviceActionsNames()]){
            keys.push(this._mapKey(key));
        }

        if (this._actions.has(actionObject.name)){
            this._addNewKeysForAction(actionObject.name, keys);
        } 
        else {
            this._actions.set(actionObject.name, {name: actionObject.name, [this._getDeviceActionsNames()]: keys, enabled: actionObject.enabled});
        }

        this._actions.get(actionObject.name).enabled = actionObject.enabled; 
    }

    _addNewKeysForAction(actionName, keys){
        keys.forEach(key => {
            if (!this._actions.get(actionName)[this._getDeviceActionsNames()].includes(key)){
                this._actions.get(actionName)[this._getDeviceActionsNames()].push(key)
            }
        });
    }

    /**
     * Добавляет ивенты на таргет
     */
    addEventListeners(){
        if (!this._target) return;

        for (const event in this._bindedEvents){
            this._target.addEventListener(event, this._bindedEvents[event.toString()]);
        }
    }

    /**
     * Удаляет ивенты с таргета
     */
    removeEventListeners(){
        if (!this._target) return;

        for (const event in this._bindedEvents){
            this._target.removeEventListener(event, this._bindedEvents[event.toString()]);
        }
    }
    
    /**
     * Прикрепляет плагин к таргету
     * @param {HTMLElement} target DOM элемент, к которому прикрепляется плагин + сразу кидает на него слушатели
     */
    attach(target){
        if (this._target === target) return;

        this.detach();

        this._target = target;

        this.addEventListeners();
    }

    /**
     * Открепляет плагин от таргета + сразу убирает слушатели
     */
    detach(){
        if (!this._target) return;

        this.removeEventListeners();

        this._activeActions.clear();
        this._keys_active.clear();
        this._target = null;
    }

    /**
     * Включает экшен
     * @param {string} actionName Название экшена
     */
    enableAction(actionName){
        this._actions.get(actionName).enabled = true;
    }

    /**
     * Выключает экшен
     * @param {string} actionName Название экшена
     */
    disableAction(actionName){
        this._actions.get(actionName).enabled = false;
    }

    /**
     * Проверяет наличие экшена
     * @param {string} actionName Название экшена
     * @returns {boolean}
     */
    hasAction(actionName){
        return this._actions.has(actionName);
    }

    /**
     * Проверяет активность экшена
     * @param {string} actionName Название экшена
     * @returns {boolean}
     */
    isActionActive(actionName){
        if (!this._actions.get(actionName)) {
            return false;
        }

        return this._activeActions.get(actionName);
    }

    /**
     * Проверяет активность клавиши
     * @param {number} keyCode Код клавиши (например "32" для клавиатуры, "left" для мыши)
     * @returns {boolean}
     */
    isKeyPressed(keyCode){
        return this._keys_active.get(keyCode) ?? false;
    }

    /**
     * Очищает активные экшены и клавиши
     */
    clearActiveActions(){
        this._activeActions.clear();
        this._keys_active.clear();
    }

    /**
     * Активирует экшен, проверяет что:
     * 1. Он включен (action.enabled)
     * 2. Такой же экшен по другой кнопке не активен в этом плагине
     * 3. Другие плагины не активны на этот экшен
     * @param {string} actionName Название экшена
     */
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

        this._target.dispatchEvent(new CustomEvent(ACTION_ACTIVATED, {bubbles : true, detail: {actionName: actionName}}));
        
    }

    /**
     * Деактивирует экшен, проверяет что:
     * 1. Он включен (action.enabled) // наверное мб не стоит проверять но я не уверен   
     * 2. Такой же экшен по другой кнопке не активен в этом плагине
     * 3. Другие плагины не активны на этот экшен
     * @param {string} actionName Название экшена
     */
    _deactivateAction(actionName){
        if (!this._actions.get(actionName).enabled){
            return;
        }

        if (this._activeActions.get(actionName)){

            this._activeActions.set(actionName, this._activeActions.get(actionName) - 1);

            if (this._activeActions.get(actionName) == 0){  

                if (this._inputController.isActionActiveInOtherPlugins(actionName, this)){
                    return;
                }
               
                this._target.dispatchEvent(new CustomEvent(ACTION_DEACTIVATED, {bubbles : true, detail: {actionName: actionName}}));
            }
        }
    }

    /**
     * Можно написать лучше хз
     * @param {number} key Код клавиши
     * @returns {Array<string>} Массив названий экшенов
     */
    _getActionsNames(key){
        let actionsName = [];
        for (const action of this._actions.values()){
            if (action[this._getDeviceActionsNames()]?.includes(key)){
                actionsName.push(action.name);
            }
        }
        return actionsName;
    }

}
