class ValueChangeEvent<T> {
  public readonly oldValue: T;
  public readonly newValue: T;

  public constructor(oldValue: T, newValue: T) {
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
}

interface IValueChangeListener<T> {
  onValueChange(event: ValueChangeEvent<T>): void;
}

export default class BindableValue<T> implements IValueChangeListener<T> {
  private current!: T;

  get Current() {
    return this.current;
  }

  set Current(value: T) {
    const ruledNewCurrent = this.applyValueChangeRules(value);
    const changeEvent = new ValueChangeEvent(this.current, ruledNewCurrent);

    /**
     * We fire it before actually assigning it because of some nuances on how "set" actually works.
     * Otherwise "triggerValueChange" will raise some really unexpected behaviors
     */
    this.triggerValueChange(this, changeEvent);

    this.current = ruledNewCurrent;
  }

  private default!: T;

  get Default() {
    return this.default;
  }

  set Default(value: T) {
    this.default = this.applyValueChangeRules(value);
  }

  public constructor(value?: T, defaultValue: T | undefined = value) {
    const appliedCurrentValue: T | null = value ?? this.defaultCurrentValue();

    if (appliedCurrentValue === null) {
      throw "The built bindable doesn't appear to have a default defaultValue and you didn't supply a value to it.";
    }

    this.Current = appliedCurrentValue;
    this.Default = value ? appliedCurrentValue : defaultValue!;
  }

  public applyValueChangeRules(value: T): T {
    return value;
  }

  public changeToDefaultValue() {
    this.Current = this.default;
  }

  protected onValueChangeListeners: IValueChangeListener<T>[] = [];

  public addValueChangeListener(listener: IValueChangeListener<T>) {
    this.onValueChangeListeners.push(listener);
  }

  public removeValueChangeListener(listener: IValueChangeListener<T>) {
    this.onValueChangeListeners.filter((o) => o != listener);
  }

  public triggerValueChange(source: this, event: ValueChangeEvent<T>): void {
    if (event.oldValue != event.newValue) {
      for (const listener of this.onValueChangeListeners) {
        if (listener == source) continue;
        listener.onValueChange(event);
      }
    }
  }

  public onValueChange(_event: ValueChangeEvent<T>): void {}
  public defaultCurrentValue(): T | null {
    return null;
  }
}