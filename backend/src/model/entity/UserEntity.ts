import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type User = {
  id: number;
  deviceId: string;
  email: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

@Entity({ name: 'user' })
export class UserEntity implements User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null = null;

  @Column({ type: 'datetime', name: 'created_at', default: null })
  createdAt!: string;

  @Column({ type: 'datetime', name: 'updated_at', default: null })
  updatedAt: string | null = null;

  @BeforeInsert()
  setDateCreated(): void {
    this.createdAt = new Date().toISOString();
  }

  @BeforeUpdate()
  setDateUpdated(): void {
    this.updatedAt = new Date().toISOString();
  }
}
