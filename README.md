# Sistema de Hoteleria

Sistema de gestion hotelera con backend en ASP.NET Core y frontend en React + Vite + TypeScript.

## Estructura del proyecto

- src/HotelSystem.API - API REST (.NET)
- src/HotelSystem.Application - Casos de uso y servicios
- src/HotelSystem.Domain - Entidades y reglas de dominio
- src/HotelSystem.Infrastructure - Persistencia y servicios externos
- src/HotelSystem.Web - Frontend React
- tests/HotelSystem.UnitTests - Pruebas unitarias

## Requisitos

- .NET SDK 10
- Node.js 20+
- SQL Server

## Backend

cd src/HotelSystem.API
dotnet run

## Frontend

cd src/HotelSystem.Web
npm install
npm run dev

## Documentacion

- especificaciontecnica.md
- plantrabajo.md
- datosbd.md