using System;

namespace HotelSystem.Domain.Common
{
    public abstract class Entity
    {
        public Guid Id { get; protected set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; }

        protected Entity()
        {
            Id = Guid.NewGuid();
        }
    }
}
