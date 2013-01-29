# Widgets 101

## _WidgetBase

- Create a class with `declare()`.
- Any object created with `new()` will be initialised with `preamble()`, `constructor()` and `postscript()`.

- Take as an example `SomeWidget = declare( [_WidgetBase], {} ); w = new SomeWidget( {param1: 'one', param2: 2} )`
    - `this.constructor( params, srcNodeRef )` is called . This will run _before_ anything else. You can do whatever you like there
    - `_WidgetBase::postscript( params, srcNodeRef )` is called
    - All `postscript()` does is call `_Widgetbase::create(params, srcNodeRef)`
    - `_Widgetbase::create(params, srcNodeRef)` is the _real_ deal

## _WidgetBase::create(params, srcNodeRef)

- The following happens when you create `w`:
    - `this.srcNodeRef`, if present, is assigned to the DOM node with id `srcNodeRef`
    - `params` are mixed in with the object `w`.
    - **CALLS**: `postMixinProperties()`
    - `this.id` is created (unless it was part of params and got mixed in)
    - The variables  `this.ownerDocument` and `this.ownerDocumentBody` are set (although you can pass `ownerDocument` in params)
    - Widget is added to the registry
    - **CALLS**: `buildRendering()`. **NOTE**:
        - `buildRendering()` will define `this.domNode`, which will be the DOM of the widget. The "stock" `buildRendering()` from `_WidgetBase` will make sure this.domNode is indeed set by assigning it to `srcNodeRef` (if passed as parameter) or, as a last resort, create an `<div>` in `ownerDocument` (won't actually be displayed!). Most of the time, the "parent" `buildRendering()` will create `this.domNode` _before_ calling `this.inherited(arguments)`
        - `buildRendering` also assigns DOM classes to the widget according to the parameter `this.baseClass`
    - **CALLS**: `this._applyAttributes()`. Basically, if you passed { color: 'blue' } as an attribute, then `_setColorAttr()` will be called with 'blue' as a parameter. (Note: `this._setColorAttr()` is what is called when you run `this.set('color', 'blue')`)
    - If `this.domNode` is different to `this.srcNodeRef` (see above: it might be the same if none of the inherited widgets replaced `this.domNode` and `this.srcNodeRef` was set), then `this.domNode` will _replace_ outright `this.srcNodeRef`. This is when the magic begins.
        - **NOTE**: basically, if `srcNodeRef` _is_ specified, the widget will always replace it at `create()` time!
    - `this.domNode` will have a VERY IMPORTANT attribute set: `widgetId`. This is the "link" between the DOM node and the Dojo widget
    - **CALLS**: `postCreate()`
- NOTE: You must call `this.inherited(arguments)` when redefining `postMixinProperties()`, `buildRendering()`, `postCreate()` etc. but
  mustn't call it when defining the `constructor()`

## _WidgetBase::startup(params, srcNodeRef) (and _WidgetBase::containerNode)

- `_WidgetBase::startup()` is _not_ called after `_WidgetBase::create()`. It's up to the developer to call it. It should only be called once the widget's DOM is in document flow, as its main goal is to contain  any logic reliant on the widget's dimensions (when `postCreate()` is called, the DOM structure has been created but it may or may not be rendered in the document.)
- `this.placeAt()` will `startup()` the widget if the parent has already been started.
- The stock `Widgetbase::startup()` method will also call `startup()` for all contained widgets returned by `_WidgetBase::getChildren()`
    - Each widget _might_ have a `containerNode` attribute, which will point to the widget's content
    - `_Widgetbase::getChildren()` will search for any DOM node with attribute `widgetId` _and_ a corresponding widget in the widget registry (it runs `registry.findWidgets(this.containerNode)`). 

## _WidgetBase and widget placement

- If you create a widget specifying srcNodeRef, it will be "placed" there (read above)
- If you don't, you can use `this.placeAt( dest, position )`. NOTE:
    - `dest` can be a widget with `addChild()` defined: in that case, that method will be used
    - `dest` can be a widget without `addchild()` defined: in that case, the widget will be added to `dest`'s `domNode` or `containerNode`
    - `dest` can be a DOM element: it will be placed there

## _WidgetBase and attributes


### Containers (`_Container.js`) -- base for `_ContentPane` AND `_LayoutWidget`

- **CONTRACT**: It implements `addChild()`, `removeChild()`, `hasChildren()`, `getIndexOfChild()`, AND sets `this.containerNode`
- It is a mixin for widgets that contain HTML and/or a set of widget children
- `addChild()` adds the child to `this.containerNode` and calls `startup()` for it (if containing widget has already started). It also calls 
  `domConstruct.place()` which makes sure the widget's DOM node has the right widgetId (it will work with the registry)
- `addChild()` won't work well if a `ContentPane` is nested in layout widgets as `addChild()` doesn't resize() (it's unclear if the
   ContentPane is visible or not, and `resize()` doesn't work on hidden tabs). `addChild()` also doesn't call `_checkIfSingleChild()` 
   to resize a single child widget to fill the whole ContentPane.


### `ContentPane` (a `isLayoutContainer`)

#### `_ContentPaneResizeMixin`
- **CONTRACT**: Defines  `isLayoutContainer`: this widget will call `resize()` on its children when they become visible, + follow `doLayout`
  - NOTE: Since there is no concept of "hidden" in a ContentPane, it means call `resize()` on its children when ContentPane is visible
- Implements `_onShow()`, which is run either at startup (normal visible contentPane) or by its parent (hidden tab)
- If it's not the child of a `isLayoutContainer`, will listen to the viewport's `resize` event and run `this.resize()`
- `this._isShown()` cheats: will return `true` if it was _ever_ shown, which is good enough
- If `doLayout`:
    - If ContentPane only has a single child, the single child will be sized so that it takes the whole parent.
    - Children will be told what size they should be (will be passed dimensions in Resize) 

#### `_ContentPane`
- It's a "sort of" a container of widget, but limited to simple widgets where everything is visible. This is due to `addChild()`'s limits
- Simply `WidgetBase` + `_Container` + `_ContentPaneResizeMixin` (which honours the `isLayoutContainer` contract).


### `_LayoutWidget` (a `isLayoutContainer`)

#### `_Contained`
- It defines `getPreviousSibling()`, `getNextSibling()`, `getIndexInParent()`
- Useful for widgets that are contained by a `isLayoutContainer` widget

#### `_LayoutWidget`
- It includes `Widgetbase` + `_Container` + `_Contained` + functions to honour the `isLayoutContainer` contract
- **CONTRACT**: Defines `isLayoutContainer`: this widget will call `resize()` on its children when they become visible, + follow `doLayout`
    - **NOTE**: unlike `_ContentPaneMixin`, children widgets might well be invisible (see: `TabContainer` etc.).
- If it's not the child of a `isLayoutContainer`, will listen to the viewport's `resize` event and run `this.resize()`
- When `this.resize()`, it will call `this.layout()`. It will be up to the Widget class to implement `this.layout()` to resize children
- It's basically up to `this.layout()` to work on layout and call onShow() on visible child (see CONTRACT)
- It extends `addChild()` and `removeChild()` so that it adds (and remove) the right DOM classes (`parent.baseClass+'-child'` and
  `parent.baseClass+'-'+child.baseClass`) for theming
- If `doLayout`:
  - If ContentPane only has a single child, the single child will be sized so that it takes the whole parent.
  - Children will be told what size they should be (will be passed dimensions in Resize) 

#### `_StackContainer`

Note: this is a very simplified description of what `_StackContainer` is, to give a rough idea of how it uses `_LayoutWidget`

- It simply inherits from `_LayoutWidget`
- `this.layout()` is a function that will resize just the selected child (as required)
- At `startup()`:
    - It looks through its children and sets the one with `child.selected` as the one to display. NOTE: might use cookies too (`this.persist`)
    - Sets children's class as `dijitHidden` (instead of `dijitVisible`), so everything is hidden
- Publishes a topic `this.id+'-startup'`
- In `this.resize()`, if it's the first time it's shown, it calls _onShow() for the child
- In `this.addChild()`, it reruns `this.layout()` and (if it's the only child) selects it
- In `this.removeChild()`, the first child is selected and `this.layout()` is called

## Events, dojo/on, _WidgetBase, events

### dojo/on

- dojo/on is the one-stop system to emit and subscribe to events
- Two main functions: `on()` and `emit()`
    - `dojo/on(target, 'event', listener)`
        - `target` can be:
            * An object with `this.on()` defined: `dojo/on` will delegate to that function. This is what happens in widgets! **OR**
            * An object with `this.addEventListener()` defined: it will use it using the same API as DOM, but it might be anything. **OR**
            * An object with `this.attachEvent()` defined (this is for retarded IE which up to v.9 didn't have `this.addEventListener`) **OR**
            * It will _fail_
    - `dojo/emit(target, 'event', listener)`
        - `target` can be:
            - An object with `this.dispatchEvent()` defined (it's a DOM node): it will use native event emission (DOM) **OR**
            - An object with `this['on'+event]`: it will call that, _and_ **it will bubble up** to `parentNode` if event is meant to bubble up. This is done 100% synthetically, by following parentNode attributes.

*** QUESTION: Why doesn't `dojo/on.emit()` get delegated to the widget just like `dojo/on()` is? It seems like the obvious thing to do -- with the object's `this.emit()` which then emits through the DOM, which will then bubble things up if requested... so that the "manual" bubbling wouldn't even be necessary?

*** QUESTION: `dojo/emit(target, 'event', listener)` seems to call, synthetically for objects, onevent rather than onEvent. Didn't this use to be onEvent? Is capitalisation after "on" going away as a convention for Dojo 2.0?

### _WidgetBase

- Widgets also implement `this.on()` and `this.emit()`. However, _everything is done through the DOM_
    - `this.on('success', listener)` 
        - **TEMPORARILY, before Dojo 2** IF this['on'+success] exists, will run `aspect.after(this, 'onsuccess', listener)` to piggyback on widget methods (e.g. `this.onClick()` **OR**
        - Runs `dojo/on(this.domNode, 'event', listener)`. So, it will get `this.domNode` hooked up to `event` (which will fire `listener`).
    - `this.emit('event')`
        - Calls `this['on'+event]` if it exists in the widget (note the lack of capitalisation in 'event'). The event **will _not_ bubble up synthetically** in any case (unlike synthetic events emitted with `dojo/emit()` over widgets) **AND**
        - Runs `dojo/on.emit(this.domNode, 'event', listener)`. So, it emits down to `this.domNode`, through the widget's DOM

*** QUESTION: with `widget.emit()`, doesn't this mean that in some cases TWO callbacks will be called when emitting 'success': one will be the listener set up with `widget.on('success', listener)` and one will be the widget's `this.onsuccess()` method? Is that the behaviour to expect?

*** QUESTION: there is no logic to bubble up 'event' in _Widgetbase, I guess because the DOM will do that. But isn't this a bit inconsistent? (see question above)

