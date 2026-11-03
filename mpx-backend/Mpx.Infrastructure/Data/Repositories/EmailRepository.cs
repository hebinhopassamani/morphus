using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;

namespace Mpx.Infrastructure.Data.Repositories;

public class EmailRepository(MorphusDbContext Context) : MorphusRepository<Email>(Context), IEmailRepository
{ }
