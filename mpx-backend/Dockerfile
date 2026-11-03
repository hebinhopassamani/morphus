FROM mcr.microsoft.com/dotnet/sdk:11.0 AS build
WORKDIR /src

# Copia os arquivos de solução e projetos primeiro para aproveitar o cache de camadas do Docker
COPY ["global.json", "./"]
COPY ["morphus-bkd.slnx", "./"]
COPY ["Mpx.Api/Mpx.Api.csproj", "Mpx.Api/"]
COPY ["Mpx.Application/Mpx.Application.csproj", "Mpx.Application/"]
COPY ["Mpx.CrossCutting/Mpx.CrossCutting.csproj", "Mpx.CrossCutting/"]
COPY ["Mpx.Domain/Mpx.Domain.csproj", "Mpx.Domain/"]
COPY ["Mpx.Infrastructure/Mpx.Infrastructure.csproj", "Mpx.Infrastructure/"]

RUN dotnet restore "Mpx.Api/Mpx.Api.csproj"

# Copia todo o restante do código-fonte e publica em modo Release
COPY . .
WORKDIR "/src/Mpx.Api"
RUN dotnet publish "Mpx.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagem final enxuta contendo apenas o runtime ASP.NET 11
FROM mcr.microsoft.com/dotnet/aspnet:11.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Mpx.Api.dll"]
