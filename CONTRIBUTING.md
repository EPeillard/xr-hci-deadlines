# Proposer une conférence ou une édition

Étudiants et collègues peuvent proposer une entrée par issue ou pull request dans le dépôt GitHub qui héberge le site. Inclure le nom, le lien officiel et une courte explication de son intérêt pour l’équipe. Le mainteneur vérifie les dates avant de les afficher comme échéances.

## Catalogue

Dans `conferences.json`, chaque famille contient :

- `id` : identifiant stable, unique ;
- `name`, `url`, `why` : nom, source officielle ou lien du catalogue et intérêt scientifique ;
- `scope` : `France / francophonie`, `Europe` ou `International` (communauté, pas lieu) ;
- `topics` : liste de thèmes ;
- `priority` : `Cœur` ou `Selon le projet`, jugement éditorial de pertinence sans classement scientifique ;
- `kind` : conférence, journées, école ou salon ;
- `verified` : indique si la source officielle de cette famille a été consultée, pas si toutes les prochaines dates sont connues.

## Éditions et échéances

Une édition n’est ajoutée à `editions` qu’après vérification de sa date et de son lieu sur une source officielle. Champs : `id`, `family_id`, `year`, `start`, `end`, `location`, `region`, `url`, `checked`, `tracks`. Région du lieu : `France`, `Europe` ou `Hors Europe`. Dates de rencontre : `YYYY-MM-DD` ; `end` est inclusif.

Chaque contribution dans `tracks` contient `label`, `type`, `deadline`, `source`, `note`. Le `deadline` est un timestamp ISO 8601 avec décalage explicite, par exemple `2026-12-07T23:59:59-12:00` pour une limite AoE. Ne jamais utiliser minuit UTC à la place de l’AoE.

N’ajouter une heure que si elle est publiée dans l’appel. Si seule une date est connue, laisser la contribution hors de `tracks` et indiquer ce point dans l’issue jusqu’à vérification. Une édition peut avoir `tracks: []` : ses dates de rencontre sont vérifiées mais ses deadlines ne sont pas renseignées.

En cas de prolongation, remplacer la date par la limite publiée et mentionner l’ancienne date dans `note`. Vérifier les prérequis de dépôt (résumé obligatoire avant l’article ou le poster) et ajouter chaque étape. Ne pas reconduire automatiquement une date d’une année à l’autre.

Après modification : `node tests/check.cjs`, puis `python3 scripts/build.py`. Vérifier l’affichage sur mobile et ordinateur avant diffusion à l’équipe.
