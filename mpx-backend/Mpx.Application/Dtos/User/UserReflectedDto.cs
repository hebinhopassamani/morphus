using System.Linq.Expressions;

using Mpx.Core.Dtos;
using Mpx.Domain.Entities;

namespace Mpx.Application.Dtos;

public class UserReflectedDto : MpxDto<User, UserReflectedDto>
{
  public string? Name { get; set; }
  public string? Email { get; set; }
  public bool EmailConfirmed { get; set; }
  public bool PhoneConfirmed { get; set; }
  public bool TermsConfirmed { get; set; }
  public bool OnboardingCompleted { get; set; }
  public Guid? UserStatusId { get; set; }
  public string? NickName { get; set; }
  public string? Picture { get; set; }
  public string? PhoneNumber { get; set; }
  public string? Website { get; set; }
  public string? Gender { get; set; }
  public DateTime? Birthdate { get; set; }

  protected override Expression<Func<User, UserReflectedDto>> BaseProjection => u => new UserReflectedDto
  {
    Id = u.Id,
    Key = u.Key,
    System = u.System,
    Inactive = u.Inactive,
    CorporationId = u.CorporationId,
    Name = u.Name,
    Email = u.Email,
    EmailConfirmed = u.EmailConfirmed,
    PhoneConfirmed = u.PhoneConfirmed,
    TermsConfirmed = u.TermsConfirmed,
    OnboardingCompleted = u.OnboardingCompleted,
    UserStatusId = u.UserStatusId,
    NickName = u.NickName,
    Picture = u.Picture,
    PhoneNumber = u.PhoneNumber,
    Website = u.Website,
    Gender = u.Gender,
    Birthdate = u.Birthdate
  };
}
