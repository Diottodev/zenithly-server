import {
  array,
  boolean,
  type InferOutput,
  literal,
  minLength,
  number,
  object,
  optional,
  pipe,
  string,
  union,
} from 'valibot';

export const createGoogleCalendarEventSchema = object({
  summary: optional(pipe(string(), minLength(1, 'O resumo é obrigatório'))),
  description: optional(string()),
  start: object({
    dateTime: optional(
      pipe(string(), minLength(1, 'A data e hora de início são obrigatórias'))
    ),
    timeZone: optional(
      pipe(string(), minLength(1, 'O fuso horário de início é obrigatório'))
    ),
  }),
  end: object({
    dateTime: optional(
      pipe(string(), minLength(1, 'A data e hora de término são obrigatórias'))
    ),
    timeZone: optional(
      pipe(string(), minLength(1, 'O fuso horário de término é obrigatório'))
    ),
  }),
  attendees: optional(
    array(
      object({
        email: optional(
          pipe(string(), minLength(1, 'O e-mail do participante é obrigatório'))
        ),
      })
    )
  ),
  reminders: optional(
    object({
      useDefault: optional(boolean()),
      overrides: optional(
        array(
          object({
            method: union([literal('email'), literal('popup')]),
            minutes: number(),
          })
        )
      ),
    })
  ),
});

export const updateGoogleCalendarEventSchema = object({
  summary: optional(pipe(string(), minLength(1, 'O resumo é obrigatório'))),
  description: optional(string()),
  start: optional(
    object({
      dateTime: optional(
        pipe(string(), minLength(1, 'A data e hora de início são obrigatórias'))
      ),
      timeZone: optional(
        pipe(string(), minLength(1, 'O fuso horário de início é obrigatório'))
      ),
    })
  ),
  end: optional(
    object({
      dateTime: optional(
        pipe(
          string(),
          minLength(1, 'A data e hora de término são obrigatórias')
        )
      ),
      timeZone: optional(
        pipe(string(), minLength(1, 'O fuso horário de término é obrigatório'))
      ),
    })
  ),
  attendees: optional(
    array(
      object({
        email: pipe(
          string(),
          minLength(1, 'O e-mail do participante é obrigatório')
        ),
      })
    )
  ),
  reminders: optional(
    object({
      useDefault: optional(boolean()),
      overrides: optional(
        array(
          object({
            method: union([literal('email'), literal('popup')]),
            minutes: number(),
          })
        )
      ),
    })
  ),
});

export type TCreateGoogleCalendarEvent = InferOutput<
  typeof createGoogleCalendarEventSchema
>;
export type TUpdateGoogleCalendarEvent = InferOutput<
  typeof updateGoogleCalendarEventSchema
>;
