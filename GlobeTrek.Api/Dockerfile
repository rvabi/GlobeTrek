FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY GlobeTrek.Api.csproj ./
RUN dotnet restore GlobeTrek.Api.csproj
COPY . ./
RUN dotnet publish GlobeTrek.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000
USER 1000:1000
ENTRYPOINT ["sh", "-c", "exec dotnet GlobeTrek.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
