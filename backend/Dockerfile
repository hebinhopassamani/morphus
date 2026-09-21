FROM mcr.microsoft.com/dotnet/sdk:9.0 AS Base
USER app
WORKDIR /app
EXPOSE 5287

# ==========================================
# Stage 2: Build Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files first using exact case-sensitive matching
COPY ["Wkf333.Api/Wkf333.Api.csproj", "Wkf333.Api/"]
COPY ["Wkf333.Application/Wkf333.Application.csproj", "Wkf333.Application/"]
COPY ["Wkf333.CrossCutting/Wkf333.CrossCutting.csproj", "Wkf333.CrossCutting/"]
COPY ["Wkf333.Data/Wkf333.Data.csproj", "Wkf333.Data/"]
COPY ["Wkf333.Domain/Wkf333.Domain.csproj", "Wkf333.Domain/"]
COPY ["Wkf333.Morphus/Wkf333.Morphus.csproj", "Wkf333.Morphus/"]

# Restore NuGet packages
RUN dotnet restore "Wkf333.Api/Wkf333.Api.csproj"

# Copy the remaining source code
COPY . .
WORKDIR "/src/Wkf333.Api"

# Build the application
RUN dotnet build "Wkf333.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# ==========================================
# Stage 3: Publish
# ==========================================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Wkf333.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# ==========================================
# Stage 4: Final Image
# ==========================================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# FIX: Adjusted DLL name casing to match your project assembly name
ENTRYPOINT ["dotnet", "Wkf333.Api.dll"]
