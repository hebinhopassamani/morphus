using Mpx.Domain.Entities;
using Mpx.Domain.Interfaces;
using Mpx.Infrastructure.Data.Core;

namespace Mpx.Infrastructure.Data.Repositories;

public class EmailRepository(MpxDbContext Context) : MpxRepository<Email>(Context), IEmailRepository
{ }

