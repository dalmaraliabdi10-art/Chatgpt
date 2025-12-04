## Skapa en Veckovis OWASP Dependency Check Pipeline i Azure DevOps

Denna guide beskriver hur du skapar en ny Azure DevOps build pipeline för att köra OWASP Dependency Check på en veckobasis. Detta är användbart för att regelbundet granska och hantera säkerhetsrisker i ditt projekt.

### Steg 1: Förbered YAML Konfigurationsfilen
1. **Skapa en ny YAML-fil** i ditt React-projekt.
   - Namnge filen på ett beskrivande sätt, t.ex. `dependency-check-weekly.yml`.
   - Placera filen i rotmappen av ditt projekt eller i en undermapp om det passar ditt projekts struktur.

### Steg 2: Konfigurera Pipeline Schema
1. **Öppna den nyskapade YAML-filen** och lägg till följande konfiguration:

   ```yaml
   schedules:
     - cron: "0 0 * * 0"
       displayName: Weekly build
       branches:
         include:
         - master
       always: true

   trigger: none

   pool:
     vmImage: ubuntu-latest

   steps:
     - task: dependency-check-build-task@6
       inputs:
         projectName: 'chatgpt'
         format: 'HTML'
   ```

   - `cron: "0 0 * * 0"`: Detta definierar att pipeline ska köras klockan 00:00 varje söndag.
   - `displayName`: Namn på schemalagda bygget.
   - `branches: include: - master`: Definierar att det endast gäller `master`-grenen.
   - `always: true`: Säkerställer att pipeline körs även om inga förändringar gjorts sedan senaste schemalagda körningen.
   - `trigger: none`: Inaktiverar automatiska triggers på kodändringar.
   - `vmImage: ubuntu-latest`: Använder den senaste Ubuntu-bilden för byggmiljön.
   - `steps`: Inkluderar stegen för att köra OWASP Dependency Check.

### Steg 3: Ladda upp och Konfigurera i Azure DevOps
1. **Pusha YAML-filen till ditt kodförvar.**
2. **Gå till Azure DevOps och navigera till ditt projekt.**
3. **Skapa en ny pipeline** genom att välja den uppladdade YAML-filen som konfigurationskälla.

### Steg 4: Testa och Verifiera
1. **Kör din pipeline manuellt** för att säkerställa att allt är korrekt konfigurerat.
2. **Kontrollera loggar och rapporter** för att se till att OWASP Dependency Check körs och producerar förväntade resultat.

### Steg 5: Underhåll och Övervakning
1. **Övervaka din pipeline regelbundet** för att hålla koll på säkerheten i ditt projekt.
2. **Uppdatera konfigurationsfilen vid behov** för att justera schemat eller andra inställningar.

---

Genom att följa dessa steg skapar du en effektiv och automatisk process för att regelbundet analysera och hantera säkerhetsrisker i din React-applikation. Detta är ett utmärkt sätt att proaktivt upprätthålla höga säkerhetsstandarder i ditt projekt.