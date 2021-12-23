import Localizer from '../framework/localization/Localizer';
import StringWithVariablesManager from '../framework/localization/StringWithVariablesManager';
import IFurudeResource from './IFurudeResource';
import SupportedFurudeLocales from './SupportedFurudeLocales';
import { variablePrefix } from '../framework/localization/StringWithVariablesManager';
import IVariableManagerGetter from '../framework/localization/IVariableManagerGetter';
import FurudeResource from './FurudeResource';
import FurudeTranslationKeys from './FurudeTranslationKeys';
import ResourceResolver from './ResourceResolver';
import DirectoryMapper from '../framework/io/DirectoryMapper';
import path from 'path';
import IFurudeRunner from '../discord/commands/interfaces/IFurudeRunner';

const resourceResolver = new ResourceResolver(
  new DirectoryMapper(path.join(__dirname, 'resources'))
);

const defaultFurudeLocale = SupportedFurudeLocales.english;

const translations: FurudeResource[] = [];
const stringWithVariablesManager = new StringWithVariablesManager();

let builtGlobals = false;

export default class FurudeLocales extends Localizer<IFurudeResource> {
  private readonly runner?: IFurudeRunner<any>;
  public language: SupportedFurudeLocales;

  public constructor(options?: {
    language?: SupportedFurudeLocales;
    runner?: IFurudeRunner<any>;
  }) {
    super({
      defaultLocale: defaultFurudeLocale,
      locales: translations,
    });
    this.language =
      options?.language ??
      this.runner?.args?.furudeUser.preferred_locale ??
      defaultFurudeLocale;
  }

  public async build() {
    if (!builtGlobals) {
      translations.push(
        ...(await resourceResolver.getAllObjects()).map((r) => r.object)
      );
      for (const value of translations) {
        for (const key in value.structure) {
          const template = (
            value.structure as unknown as Record<string, string>
          )[key];
          if (template && template.includes(variablePrefix)) {
            stringWithVariablesManager.addString(
              template,
              this.getKey(SupportedFurudeLocales[value.furudeLocale], key)
            );
          }
        }
      }
    }
    builtGlobals = true;
    this.onReady();
  }

  private getKey(locale: SupportedFurudeLocales, key: string) {
    return `${locale}-${key}`;
  }

  /**
   *
   * @param key localized key to get a localized string
   * @param options lng: selected language, values: used for replace placeholder string values
   * @returns a localized string
   */
  public get(
    key: FurudeTranslationKeys,
    options?: {
      values?: Partial<IVariableManagerGetter>;
    }
  ) {
    const find = translations.find((translation) => {
      return translation.locale == this.language;
    })?.structure[key];
    if (!find) return '';
    if (options?.values) {
      options.values.key = this.getKey(
        this.language,
        options.values.key ?? key
      );
      options.values.args = options.values.args ?? [];
      if (stringWithVariablesManager.stringsWithVariables[options.values.key]) {
        return (
          stringWithVariablesManager.getString(
            options.values as IVariableManagerGetter
          ) ?? ''
        );
      }
    }
    return find;
  }
}
