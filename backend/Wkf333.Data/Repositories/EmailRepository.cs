using Morphus.Context;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Morphus.Domain.Entities.Models;
using Morphus.Domain.IRepositories;

namespace Morphus.Repository;

public class EmailRepository(W3DbContext mpsContext, IHttpContextAccessor httpContext) : MorphusRepository<Email>(mpsContext, httpContext), IEmailRepository
{
  protected readonly W3DbContext context = mpsContext;

  public async Task<List<Email>> GetEmailToSend()
  {
    var query = context.Email
                       .AsNoTracking()
                        .Include(m => m.EmaislTo)
                        .Include(m => m.EmailsFrom)
                        .Include(m => m.EmailsCc)
                        .Include(m => m.EmailsBcc)
                       .Where(r => r.MailSent == false);

    return await query.ToListAsync();
  }
}
