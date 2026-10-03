import type {StructureResolver} from 'sanity/structure'

const groups: [string, string[]][] = [
  ['Course', ['course', 'topic', 'learningObjective', 'examScope']],
  ['Material', ['lecture', 'slideDeck', 'book', 'bookChapter']],
  ['Work', ['assignment', 'submission']],
  ['Web', ['webReference']],
]

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Scholia')
    .items(
      groups.map(([title, types]) =>
        S.listItem()
          .title(title)
          .child(
            S.list()
              .title(title)
              .items(types.map((t) => S.documentTypeListItem(t))),
          ),
      ),
    )
