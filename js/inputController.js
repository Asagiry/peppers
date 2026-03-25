import {ACTION_ACTIVATED, ACTION_DEACTIVATED} from "./const.js";

/**
 *  универсальный контроллер, реализующий абстрактный интерфейс между источником ввода :
 *  (клавиатура, тач-панель, мышь, геймпад, танцевальный коврик и т.д.)
 *  и объектом, который будет использовать эти данные.
 * 
 *  Этот контроллер необходим для того, чтобы можно было добавить в приложение новые устройства ввода 
 *  или модифицировать существующие, не трогая основную часть приложения, т.к. этот контроллер преобразует 
 *  все внешние сигналы в стандартный понятный приложению формат.
 */
export class InputController {

    //#region GettersSetters

    /**
     * Включение/отключение генерации событий контроллера
     */
    get enabled() {return this._enabled;}
    set enabled(value) {this._enabled = value;}

    /**
     * DOM-элемент на котором слушает события клавиатуры и диспачит свои события
     * Не уверен нужно ли сразу аттачить в сеттере, но с флагом dontEnable = true вроде норм
     */
    get target() {return this._target;}
    set target(value) {this.attach(value, true);}

    /**
     * Находится ли окно с целью контроллера в фокусе
     */
    get focused() {if (this._target) return this._target.contains(document.activeElement); else return false;}
    
    /**
     * Делает фокус на DOM-элемент на котором слушает события клавиатуры и диспачит свои события
     */
    set focused(value) {if (value) this._target.focus(); else this._target.blur();}
    
    /**
     * Массив плагинов устройств ввода
     */
    get plugins() {return this._plugins;}

    /**
     * Устанавливает массив плагинов устройств ввода
     * @param {Array<Object>} value Массив плагинов устройств ввода и если есть DOM-элемент, плагины атачатся к нему
     */
    set plugins(value) {
        this._plugins = value;

        for (const plugin of this._plugins){
            plugin.inputController = this;

            if (this._target) plugin.attach(this._target);
        }

    }

    /**
     * Активные экшены Map <actionName(string), isActive(boolean)>
     */
    get activeActions() {return this._activeActions;}

    //#endregion

    //#region PrivateFields

    _enabled;
    _target;
    _plugins;
    _activeActions;

    //#endregion 

    //#region BindedEvents

    _bindedOnBlur;

    _bindedOnActionActivated;
    _bindedOnActionDeactivated;
    
    //#endregion

    /**
     *  Конструктор
     *  @param {Array<Object>} actionsToBind Объект с активностями. Описание в методе bindActions
     *  @param {Object} target DDOM-элемент на котором слушает события клавиатуры и диспачит свои события
     *  @param {Array<Object>} plugins Массив плагинов устройств ввода
     *  @returns {InputController} экземпляр созданного класса контроллера
     */
    constructor(actionsToBind = [], target = null, plugins = []) {
        this._enabled = false;
        this.plugins = plugins;

        this._init();

        if (target) {
            this.attach(target);

        }
        if (actionsToBind) {
            this.bindActions(actionsToBind);
        }

        return this;
    }

    _init(){
        this._activeActions = new Map();

    }

    /**
     *  Добавляет в контроллер переданные активности.
     *  @param {Array<Object>} actionsToBind Массив экшенов для связывания.
     */
    bindActions(actionsToBind) {
        for (const plugin of this._plugins){
            plugin.bindActions(actionsToBind);
        }
    }

    /**
     *  Включает объявленную активность - включает генерацию событий для этой активности при изменении её статуса. 
     *  Если включено:
     *      - при проверке активности через isActionActive возвращает актуальное состояние активности 
     *          (напр. для клавиатуры нажата кнопка или нет), иначе всегда возвращает false
     *      - может генерировать событие при изменении состояния действия, иначе событие не генерируется
     *  @param {string} actionName Название активности
     */
    enableAction(actionName) {
        for (const plugin of this._plugins){
            if (plugin.hasAction(actionName)){
                plugin.enableAction(actionName);
            }
        }
    }

    /**
     * Деактивирует объявленную активность - выключает генерацию событий для этой активности. 
     * После чего при проверке доступности этой активности через isActionActive всегда возвращает false. 
     * А также при изменении состояния активности, события не генерируются.
     *  @param {string} actionName Название активности
     */
    disableAction(actionName) {
        for (const plugin of this._plugins){
            if (plugin.hasAction(actionName)){
                plugin.disableAction(actionName);
            }
        }
    }

    /**
     *  Прикрепляет плагин к таргету
     *  @param {Object} target DOM-элемент на котором слушает события клавиатуры и диспачит свои события
     *  @param {boolean} dontEnable  Если передано true - не активирует контроллер.
     */
    attach(target, dontEnable = true) {
        if (this._target === target){ 
            this._target.focus();
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


        this._attachPlugins();

        this._createActionEvents();

        this._addTargetEvents();
    }
    
    //#region AttachHelpers
    _attachPlugins(){
        for (const plugin of this._plugins){
            plugin.attach(this._target);
        }
    }

    _createActionEvents(){
        this._bindedOnActionActivated = this._onActionActivated.bind(this);
        this._bindedOnActionDeactivated = this._onActionDeactivated.bind(this);
    }

    _addTargetEvents(){
        this._bindedOnBlur = this._onBlur.bind(this);

        this._target.addEventListener("blur", this._bindedOnBlur);

        this._target.addEventListener(ACTION_ACTIVATED, this._bindedOnActionActivated);
        this._target.addEventListener(ACTION_DEACTIVATED, this._bindedOnActionDeactivated);
    }
    //#endregion

    /**
     * Отцепляет контроллер от активного DOM-элемента и деактивирует контроллер.
     */
    detach() {
        if (!this._target){
            return;
        }

        this._enabled = false;

        for (const plugin of this._plugins){
            plugin.detach();
        }

        this._removeTargetEvents();

        this._clearTarget();
    }

    //#region DetachHelpers

    _removeTargetEvents(){
        this._target.removeEventListener("blur", this._bindedOnBlur);

        this._target.removeEventListener(ACTION_ACTIVATED, this._bindedOnActionActivated);
        this._target.removeEventListener(ACTION_DEACTIVATED, this._bindedOnActionDeactivated);
    }
    
    _clearTarget(){
        this._target = null;
        this._activeActions.clear();

        this._bindedOnBlur = null;
        this._bindedOnActionActivated = null;
        this._bindedOnActionDeactivated = null;
    }

    //#endregion DetachHelpers

    /**
        Проверяет активирована ли переданная активность в контроллере 
        (напр. для клавиатуры: зажата ли одна из соответствующих этой активности кнопок)
        @param {string} actionName Название активности для проверки
        @returns {boolean} true - активность активирована, false - нет
    **/
    isActionActive(actionName) {
        return this._activeActions.get(actionName);
    }

    /**
     * Метод для источника ввода клавиатура(По документации должен быть только для клавиатуры, но я расширил сделал для любого плагина.
     * Проверяет нажата ли переданная кнопка в контроллере
     * @param {number} keyCode  Код кнопки для проверки
     * @returns {boolean} true - кнопка зажата, false - нет
     */
    isKeyPressed(keyCode) {
        for (const plugin of this._plugins){
            return plugin.isKeyPressed(keyCode);
        }
    }

    /**
     * Проверяет активен ли экшен в другом плагине, кроме переданного. 
     * Если плагин не передать проверяет для всех плагинов.
     * @param {string} actionName Название активности для проверки
     * @param {InputPlugin} plugin Плагин для исключения из проверки (по умолчанию null) 
     * @returns {boolean} true - активность активна, false - нет                        
     */                                                                                  
    isActionActiveInOtherPlugins(actionName, plugin = null){
        for (const p of this._plugins){
            if (p != plugin && p.isActionActive(actionName)){          //ПО ИДЕЕ можно массив плагинов передавать и тогда проверять для всех кроме переданных плагинов
                return true;                                           //Но вроде в задаче не требовалось + тогда isActionActive просто функцию переделать а эту убрать
            }
        }
        return false;
    }

    clearActiveActions(){
        this._activeActions.clear();

        for (const plugin of this._plugins){
            plugin.clearActiveActions();
        }
    }

    //#region EventHandlers
    _onActionActivated(e){
        this._activeActions.set(e.detail.actionName, true);
    }

    _onActionDeactivated(e){
        this._activeActions.set(e.detail.actionName, false);
    }

    _onBlur(e){
        this.clearActiveActions();
    }
    //#endregion EventHandlers


}

