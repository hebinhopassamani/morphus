using Morphus.Domain.Entities.Models;
using Morphus.Domain.IMorphusRepository;

namespace Morphus.Domain.IRepositories;

public interface IEmailRepository : IMorphusRepository<Email>
{
  Task<List<Email>> GetEmailToSend();
}
