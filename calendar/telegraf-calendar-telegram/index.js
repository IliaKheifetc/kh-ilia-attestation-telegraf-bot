const Extra = require("telegraf").Extra;
const CalendarHelper = require("./calendar-helper");

class Calendar {
  /**
   * Construct the calendar
   * @param {Telegraf} bot Telegraf bot instance
   * @param {*} options Options to configure the calendar
   */
  constructor(bot, options) {
    this.bot = bot;

    this.helper = new CalendarHelper(options);
  }

  /**
   * Return Calendar Markup
   * @param {Date} date Starting date for the calendar. When null, 'today' is used
   */
  getCalendar(date) {
    if (!date) date = new Date();

    return this.helper.getCalendarMarkup(date);
  }

  /**
   * Set the callback that will be called when a date is selected
   * @param {(context: Context, date: Date) => void} onDateSelected The callback to be used
   */
  setDateListener(onDateSelected, sceneStep) {
    console.log("setDateListener");

    sceneStep.action(/calendar-telegram-date-[\d-]+/g, context => {
      console.log("this.bot.action(/calendar-telegram-date");

      if (onDateSelected) {
        console.log("onDateSelected");
        let date = context.match[0].replace("calendar-telegram-date-", "");
        console.log("onDateSelected date", date);
        return context.answerCbQuery().then(() => {
          console.log("context answerCbQuery then");
          onDateSelected(context, date);
        });
      }
    });

    sceneStep.action(/calendar-telegram-prev-[\d-]+/g, context => {
      let dateString = context.match[0].replace("calendar-telegram-prev-", "");
      console.log("dateString", dateString);

      let date = new Date(dateString);
      date.setMonth(date.getMonth() - 1);

      console.log("date", date);

      let prevText = context.callbackQuery.message.text;
      return context
        .answerCbQuery()
        .then(() =>
          context.editMessageText(prevText, this.helper.getCalendarMarkup(date))
        );
    });

    sceneStep.action(/calendar-telegram-next-[\d-]+/g, context => {
      console.log("context", context);
      console.log(
        "context.update.callback_query.message",
        JSON.stringify(context.update.callback_query.message)
      );
      const {
        message_id: messageId,
        chat: { id: chatId }
      } = context.update.callback_query.message;

      console.log("this.bot.action(/calendar-telegram-next");

      let dateString = context.match[0].replace("calendar-telegram-next-", "");
      console.log("dateString", dateString);

      let date = new Date(dateString);
      date.setMonth(date.getMonth() + 1);

      console.log("date", date);

      console.log(
        "this.helper.getCalendarMarkup(date)",
        this.helper.getCalendarMarkup(date)
      );
      console.log(
        "typeof this.helper.getCalendarMarkup(date)",
        typeof this.helper.getCalendarMarkup(date)
      );

      let prevText = context.callbackQuery.message.text;
      return context.answerCbQuery().then(
        () =>
          context.editMessageText(prevText, this.helper.getCalendarMarkup(date))
        // context.editMessageReplyMarkup(
        //   chatId,
        //   messageId,
        //   null,
        //   this.helper.getCalendarMarkup(date).reply_markup.inline_keyboard
        // )
        // context.editMessageReplyMarkup(
        //   this.helper.getCalendarMarkup(date).reply_markup
        // )
      );
    });

    sceneStep.action(/calendar-telegram-ignore-[\d\w-]+/g, context =>
      context.answerCbQuery()
    );
  }

  /**
   * Minimum selectable date
   * @param {Date} date The date to be used
   */
  setMinDate(date) {
    this.helper.setMinDate(new Date(date));
    return this;
  }

  /**
   * Maximum selectable date
   * @param {Date} date The date to be used
   */
  setMaxDate(date) {
    this.helper.setMaxDate(new Date(date));
    return this;
  }

  /**
   * Set the week day names, where the first element is `startWeekDay` name
   * @param {String[]} names Names to be used
   */
  setWeekDayNames(names) {
    this.helper.setWeekDayNames(names);
    return this;
  }

  /**
   * Set the month names
   * @param {String[]} names Names to be used
   */
  setMonthNames(names) {
    this.helper.setMonthNames(names);
    return this;
  }

  /**
   * Set the first day of the week, where 0 is Sunday
   * @param {Number} startDay Day to be used
   */
  setStartWeekDay(startDay) {
    this.helper.setStartWeekDay(startDay);
    return this;
  }
}

module.exports = Calendar;
