import FurudeResource from '../FurudeResource';
import SupportedFurudeLocales from '../SupportedFurudeLocales';
import CurrencyContainer from '../../containers/CurrencyContainer';

export default class extends FurudeResource {
  public constructor() {
    super(SupportedFurudeLocales.brazilian_portuguese, {
      // AVATAR
      AVATAR_RESPONSE: 'Aqui, toma o avatar do(a) [$USER]',

      // PING
      PING_TO_PING: 'Pinguei em [$PING]ms',
      PING_NOT_REACHABLE: 'Não consegui pingar...',

      // DEPLOY
      DEPLOY_COMMAND_NOT_FOUND:
        'Eu não consegui achar o comando especificado na minha lista de comandos...',
      DEPLOY_COMMAND_CORRUPTED:
        'O comando especificado está provavelmente corrompido!',
      DEPLOY_COMMAND_ERROR: 'Tive um erro tentando fazer deploy deste comando!',
      DEPLOY_COMMAND_SUCCESS: 'Consegui fazer deploy desse comando!',

      // CALC
      CALC_RESULTS: '[$EXPR] resulta em: [$RES]',
      CALC_ADDITIONAL_VARIABLES: 'Com as variáveis sendo: [$VARS]',
      CALC_EVALUATE_ERROR:
        'Talvez eu seja burra, MAS, eu não acho que [$EXPR] é uma expressão matemática',
      CALC_MISSING_VARIABLES:
        'Você se esqueceu de adicionar as seguintes variáveis: [$VARS], para a expressão: [$EXPR]',

      // COIN FLIP
      COIN_FLIP_HEADS: 'Cara',
      COIN_FLIP_TAILS: 'Coroa',
      COIN_FLIP_RESULT: 'Não deu outra, foi: [$RES]',

      // ERROS
      ERROR_MISSING_PERMISSIONS:
        'Você não tem permissões suficientes para executar este comando!',
      ERROR_OWNER_ONLY_COMMAND:
        'Esse comando só pode ser executado pelos meus desenvolvedores!',
      ERROR_REQUIRES_GUILD:
        'Mil desculpas MESMO, porém este comando só pode ser utilizado em um servidor...',

      // SUBCOMMANDS
      SUBCOMMAND_ERROR_NOT_FOUND:
        'Desculpa mas assim eu acho que o subcomando que você me especificou não existe sabe?',

      SUBCOMMAND_MISSING_REQUIRED:
        'Você precisa escolher um subcomando para executar este comando!',

      // CUSTOMIZE
      CUSTOMIZE_LOCALE_RESPONSE_USER:
        'Opa! configurei para eu lhe responder em "brasiliense" k.',
      CUSTOMIZE_LOCALE_RESPONSE_GUILD:
        'Coé, configurei para os membros do servidor serem respondidos assim, bróder... tmj.',
      CUSTOMIZE_LOCALE_RESPONSE_GUILD_ANY:
        'Ah então ok, vou deixar seus ~~escravos~~ escolherem suas próprias linguagens!',
      CUSTOMIZE_LOCALE_RESPONSE_CHANNEL:
        'Ok então, este canal é para os crias, certo!',
      CUSTOMIZE_LOCALE_RESPONSE_CHANNEL_ANY:
        'Então, é para os membros falarem o idioma preferido do servidor, neste canal? entendido.',

      // ECONOMY
      ECONOMY_OPEN_SUCCESS: `Papo reto então, abri uma conta de ${CurrencyContainer.CURRENCY_NAME} pra tu!`,
      ECONOMY_OPEN_FAIL: `Cê já tem uma conta de ${CurrencyContainer.CURRENCY_NAME}, coé não me enche atoa véi...`,
      ECONOMY_BALANCE_FAIL: `Você ou o usuário mencionado não possui uma conta ${CurrencyContainer.CURRENCY_NAME}...`,
      ECONOMY_MUST_HAVE_ACCOUNT: `Você primeiro precisa ter aberto uma conta ${CurrencyContainer.CURRENCY_NAME} para usar este comando...`,

      DATABASE_CITIZEN_ALREADY_CLAIMED: `Você já resgatou as suas ${CurrencyContainer.CURRENCY_NAME}s diárias hoje... Você pode regatar ${CurrencyContainer.CURRENCY_NAME}s novamente em: [$TIME].`,
      DATABASE_CITIZEN_CLAIM_SUCCESS: `Você acaba de resgatar [$AMOUNT] ${CurrencyContainer.CURRENCY_NAME}s! Você agora está em um streak de [$STREAK] dia(s), com um saldo de [$TOTAL] ${CurrencyContainer.CURRENCY_NAME}s`,

      // GUILD
      DATABASE_GUILD_WHITELISTED_XP_CHANNEL:
        'Coloquei o [$CHANNEL] pra dar uns xp legal pros membro ai.',
      DATABASE_GUILD_BLACKLISTED_XP_CHANNEL:
        'O [$CHANNEL] não vai mais dar xp então chefe...',
      DATABASE_GUILD_ALREADY_WHITELISTED_XP_CHANNEL:
        '[$CHANNEL] já ta dando xp...',
      DATABASE_GUILD_ALREADY_BLACKLISTED_XP_CHANNEL:
        '[$CHANNEL] já ta bloqueado de dar xp...',
      DATABASE_GUILD_CHANGED_TIME_FOR_XP:
        'Ok, os mano vai ter que esperar [$TIME] segundos se quiser xp agora...',

      // REMINDER
      REMINDER_NEEDS_TIME_FRAME:
        'Você tem que por ao menos um intervalo de tempo né tio... não sou adivinha não.',
      REMINDER_MAX_NUMBER_OF_REMINDERS_REACHED:
        'Você só pode ter [$LIMIT] lembretes pendentes, cê ta ligado disso né.',
      REMINDER_WILL_REMIND_YOU:
        'Ja ja te lembro disso ai então... enquanto isso vou preparar meu cafe!',
      REMINDER_REMINDING_YOU: 'Lembrete: [$TEXT]',
    });
  }
}
